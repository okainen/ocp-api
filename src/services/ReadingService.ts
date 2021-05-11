import {EventEmitter} from 'events';
import {Reading} from '@/entities';
import {CurrentUser, StepRef} from '@/entities/valueObjects';
import {StepCategories, UserRoles} from '@/entities/enums';
import {
  BadRequestError,
  DataIntegrityError,
  ForbiddenError,
  NotFoundError
} from '@/errors';
import {
  ICourseGateway,
  IEnrollmentGateway,
  IFinishedStepGateway,
  IReadingGateway,
  IWeekGateway
} from '@/interfaces/gateways';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {
  COURSE_NOT_FOUND,
  INVALID_STEP_SEQNUM,
  READING_NOT_FOUND,
  WEEK_NOT_FOUND
} from '@/constants/errors';
import {ObjectsHelper} from '@/helpers';
import {IReadingService} from '@/interfaces/services';
import {STEP_CREATED, STEP_DELETED, STEP_UPDATED} from '@/constants/events';
import {
  ReadingResModel,
  ReadingForAuthorOrAdminResModel,
  ReadingForStudentResModel
} from '@/responseModels/reading';
import {
  authorizeUser,
  getStepLineage,
  validateId,
  getFieldsQuery
} from './helpers/interfaces';

export default class ReadingService implements IReadingService {
  constructor(
    private courseGateway: ICourseGateway,
    private weekGateway: IWeekGateway,
    private finishedStepGateway: IFinishedStepGateway,
    private enrollmentGateway: IEnrollmentGateway,
    private readingGateway: IReadingGateway,
    private authorizeUser: authorizeUser,
    private validateId: validateId,
    private getLineage: getStepLineage,
    private getFieldsQuery: getFieldsQuery,
    private emitter: EventEmitter
  ) {}

  private async entityToResModel(
    reading: Reading,
    currentUser: CurrentUser | null = null,
    fields: string[] | null = null
  ) {
    const {id, name, docPath, estimatedEffort, modifiedAt, createdAt} = fields
      ? ObjectsHelper.projection(reading, fields)
      : reading;
    if (currentUser) {
      if (currentUser.role in [UserRoles.AUTHOR, UserRoles.ADMIN]) {
        return new ReadingForAuthorOrAdminResModel(
          id,
          name,
          docPath || undefined,
          estimatedEffort,
          modifiedAt,
          createdAt
        );
      }

      const stepRef = new StepRef(reading.id!, StepCategories.READING);
      const finishedStep = await this.finishedStepGateway.get(
        currentUser.id,
        stepRef
      );
      return new ReadingForStudentResModel(
        id,
        name,
        docPath || undefined,
        estimatedEffort,
        finishedStep?.createdAt
      );
    }

    return new ReadingResModel(id, name, estimatedEffort);
  }

  async create(currentUser: CurrentUser | null, reqModel: CreateStepReqModel) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const {weekId, seqNum, name, estimatedEffort} = reqModel;
    if (!this.validateId(weekId)) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    // check current user's authorship of the parent course
    const week = await this.weekGateway.get(weekId);
    if (!week) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    const course = await this.courseGateway.getByWeekId(week.id!);
    if (!course) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    if (seqNum && seqNum > week.steps.length) {
      throw new BadRequestError(INVALID_STEP_SEQNUM);
    }

    const reading = await this.readingGateway.create(
      new Reading({name, estimatedEffort})
    );

    const stepRef = new StepRef(reading.id!, StepCategories.READING);
    if (seqNum) {
      this.emitter.emit(STEP_CREATED, {week, stepRef, seqNum});
    }

    return this.entityToResModel(reading, currentUser);
  }

  private async getReading(id: string) {
    if (!this.validateId(id)) {
      throw new NotFoundError(READING_NOT_FOUND);
    }

    const reading = await this.readingGateway.get(id);
    if (!reading) {
      throw new NotFoundError(READING_NOT_FOUND);
    }

    return reading;
  }

  async get(currentUser: CurrentUser | null, id: string, queryParams: any) {
    const fields = this.getFieldsQuery(queryParams);

    const reading = await this.getReading(id);

    // get parent course
    const stepRef = new StepRef(id, StepCategories.READING);
    const {course} = await this.getLineage(stepRef);

    if (currentUser && currentUser.role === UserRoles.AUTHOR) {
      if (currentUser.id !== course.authorId) {
        throw new NotFoundError(READING_NOT_FOUND);
      }

      return this.entityToResModel(reading, currentUser, fields);
    }

    if (!course.isPublished) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    if (!currentUser) {
      return this.entityToResModel(reading, currentUser, fields);
    }

    const enrollment = await this.enrollmentGateway.get(
      course.id!,
      currentUser.id
    );

    if (!enrollment) {
      return this.entityToResModel(reading, null, fields);
    }

    return this.entityToResModel(reading, currentUser, fields);
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateStepReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const reading = await this.getReading(id);

    const stepRef = new StepRef(id, StepCategories.READING);
    const {course, week} = await this.getLineage(stepRef);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(READING_NOT_FOUND);
    }

    const {seqNum, name, estimatedEffort} = reqModel;
    if (seqNum && seqNum > course.weekIds.length) {
      throw new BadRequestError(INVALID_STEP_SEQNUM);
    }

    const updatedReading = await this.readingGateway.update(
      reading.update({
        name,
        estimatedEffort
      })
    );
    if (!updatedReading) {
      throw new DataIntegrityError(READING_NOT_FOUND);
    }

    if (seqNum) {
      this.emitter.emit(STEP_UPDATED, {week, stepRef, seqNum});
    }

    return this.entityToResModel(updatedReading, currentUser);
  }

  async uploadDoc(
    currentUser: CurrentUser | null,
    id: string,
    docPath: string
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const reading = await this.getReading(id);

    // check current user's authorship of the parent course
    const stepRef = new StepRef(id, StepCategories.READING);
    const {course} = await this.getLineage(stepRef);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(READING_NOT_FOUND);
    }

    const updatedReading = await this.readingGateway.update(
      reading.update({docPath})
    );
    if (!updatedReading) {
      throw new DataIntegrityError(READING_NOT_FOUND);
    }

    return this.entityToResModel(updatedReading, currentUser);
  }

  async delete(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, [UserRoles.ADMIN, UserRoles.AUTHOR]);

    const stepRef = new StepRef(id, StepCategories.READING);
    const {course, week} = await this.getLineage(stepRef);

    if (currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(READING_NOT_FOUND);
      }

      if (course.isPublished) {
        throw new ForbiddenError();
      }
    }

    const reading = await this.getReading(id);

    this.emitter.emit(STEP_DELETED, {week, stepRef});

    return this.entityToResModel(reading, currentUser);
  }
}
