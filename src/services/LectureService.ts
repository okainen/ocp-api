import {EventEmitter} from 'events';
import {Lecture} from '@/entities';
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
  ILectureGateway,
  IWeekGateway
} from '@/interfaces/gateways';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {
  COURSE_NOT_FOUND,
  INVALID_STEP_SEQNUM,
  LECTURE_NOT_FOUND,
  WEEK_NOT_FOUND
} from '@/constants/errors';
import {ObjectsHelper} from '@/helpers';
import {ILectureService} from '@/interfaces/services';
import {STEP_CREATED, STEP_DELETED, STEP_UPDATED} from '@/constants/events';
import {
  LectureResModel,
  LectureForAuthorOrAdminResModel,
  LectureForStudentResModel
} from '@/responseModels/lecture';
import {
  authorizeUser,
  getStepLineage,
  validateId,
  getFieldsQuery
} from './helpers/interfaces';

export default class LectureService implements ILectureService {
  constructor(
    private courseGateway: ICourseGateway,
    private weekGateway: IWeekGateway,
    private finishedStepGateway: IFinishedStepGateway,
    private enrollmentGateway: IEnrollmentGateway,
    private lectureGateway: ILectureGateway,
    private authorizeUser: authorizeUser,
    private validateId: validateId,
    private getLineage: getStepLineage,
    private getFieldsQuery: getFieldsQuery,
    private emitter: EventEmitter
  ) {}

  private async entityToResModel(
    lecture: Lecture,
    currentUser: CurrentUser | null = null,
    fields: string[] | null = null
  ) {
    const {id, name, videoPath, estimatedEffort, modifiedAt, createdAt} = fields
      ? ObjectsHelper.projection(lecture, fields)
      : lecture;
    if (currentUser) {
      if (currentUser.role in [UserRoles.AUTHOR, UserRoles.ADMIN]) {
        return new LectureForAuthorOrAdminResModel(
          id,
          name,
          videoPath || undefined,
          estimatedEffort,
          modifiedAt,
          createdAt
        );
      }

      const stepRef = new StepRef(lecture.id!, StepCategories.LECTURE);
      const finishedStep = await this.finishedStepGateway.get(
        currentUser.id,
        stepRef
      );
      return new LectureForStudentResModel(
        id,
        name,
        videoPath || undefined,
        estimatedEffort,
        finishedStep?.createdAt
      );
    }

    return new LectureResModel(id, name, estimatedEffort);
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

    const lecture = await this.lectureGateway.create(
      new Lecture({name, estimatedEffort})
    );

    const stepRef = new StepRef(lecture.id!, StepCategories.LECTURE);
    if (seqNum) {
      this.emitter.emit(STEP_CREATED, {week, stepRef, seqNum});
    }

    return this.entityToResModel(lecture, currentUser);
  }

  private async getLecture(id: string) {
    if (!this.validateId(id)) {
      throw new NotFoundError(LECTURE_NOT_FOUND);
    }

    const lecture = await this.lectureGateway.get(id);
    if (!lecture) {
      throw new NotFoundError(LECTURE_NOT_FOUND);
    }

    return lecture;
  }

  async get(currentUser: CurrentUser | null, id: string, queryParams: any) {
    const fields = this.getFieldsQuery(queryParams);

    const lecture = await this.getLecture(id);

    // get parent course
    const stepRef = new StepRef(id, StepCategories.LECTURE);
    const {course} = await this.getLineage(stepRef);

    if (currentUser && currentUser.role === UserRoles.AUTHOR) {
      if (currentUser.id !== course.authorId) {
        throw new NotFoundError(LECTURE_NOT_FOUND);
      }

      return this.entityToResModel(lecture, currentUser, fields);
    }

    if (!course.isPublished) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    if (!currentUser) {
      return this.entityToResModel(lecture, currentUser, fields);
    }

    const enrollment = await this.enrollmentGateway.get(
      course.id!,
      currentUser.id
    );

    if (!enrollment) {
      return this.entityToResModel(lecture, null, fields);
    }

    return this.entityToResModel(lecture, currentUser, fields);
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateStepReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const lecture = await this.getLecture(id);

    const stepRef = new StepRef(id, StepCategories.LECTURE);
    const {course, week} = await this.getLineage(stepRef);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(LECTURE_NOT_FOUND);
    }

    const {seqNum, name, estimatedEffort} = reqModel;
    if (seqNum && seqNum > course.weekIds.length) {
      throw new BadRequestError(INVALID_STEP_SEQNUM);
    }

    const updatedLecture = await this.lectureGateway.update(
      lecture.update({
        name,
        estimatedEffort
      })
    );
    if (!updatedLecture) {
      throw new DataIntegrityError(LECTURE_NOT_FOUND);
    }

    if (seqNum) {
      this.emitter.emit(STEP_UPDATED, {week, stepRef, seqNum});
    }

    return this.entityToResModel(updatedLecture, currentUser);
  }

  async uploadVideo(
    currentUser: CurrentUser | null,
    id: string,
    videoPath: string
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const lecture = await this.getLecture(id);

    // check current user's authorship of the parent course
    const stepRef = new StepRef(id, StepCategories.LECTURE);
    const {course} = await this.getLineage(stepRef);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(LECTURE_NOT_FOUND);
    }

    const updatedLecture = await this.lectureGateway.update(
      lecture.update({videoPath})
    );
    if (!updatedLecture) {
      throw new DataIntegrityError(LECTURE_NOT_FOUND);
    }

    return this.entityToResModel(updatedLecture, currentUser);
  }

  async delete(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, [UserRoles.ADMIN, UserRoles.AUTHOR]);

    const stepRef = new StepRef(id, StepCategories.LECTURE);
    const {course, week} = await this.getLineage(stepRef);

    if (currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(LECTURE_NOT_FOUND);
      }

      if (course.isPublished) {
        throw new ForbiddenError();
      }
    }

    const lecture = await this.getLecture(id);

    this.emitter.emit(STEP_DELETED, {week, stepRef});

    return this.entityToResModel(lecture, currentUser);
  }
}
