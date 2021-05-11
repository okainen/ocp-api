import {EventEmitter} from 'events';
import {Week} from '@/entities';
import {CurrentUser} from '@/entities/valueObjects';
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
  IQuizAttemptGateway,
  IQuizGateway,
  IWeekGateway
} from '@/interfaces/gateways';
import {CreateWeekReqModel, UpdateWeekReqModel} from '@/requestModels';
import {ObjectsHelper} from '@/helpers';
import {
  FinishedGradedStepResModel,
  GradedStepResModel,
  WeekResModel
} from '@/responseModels';
import {WEEK_CREATED, WEEK_DELETED, WEEK_UPDATED} from '@/constants/events';
import {
  COURSE_NOT_FOUND,
  INVALID_QUERY_PARAMS,
  QUIZ_ATTEMPT_NOT_FOUND,
  QUIZ_NOT_FOUND,
  WEEK_NOT_FOUND
} from '@/constants/errors';
import {IWeekService} from '@/interfaces/services';
import {authorizeUser, validateId, getFieldsQuery} from './helpers/interfaces';

export default class WeekService implements IWeekService {
  constructor(
    private courseGateway: ICourseGateway,
    private weekGateway: IWeekGateway,
    private enrollmentGateway: IEnrollmentGateway,
    private finishedStepGateway: IFinishedStepGateway,
    private quizGateway: IQuizGateway,
    private quizAttemptGateway: IQuizAttemptGateway,
    private authorizeUser: authorizeUser,
    private validateId: validateId,
    private getFieldsQuery: getFieldsQuery,
    private emitter: EventEmitter
  ) {}

  async create(currentUser: CurrentUser | null, reqModel: CreateWeekReqModel) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const {seqNum, courseId, name, description} = reqModel;
    if (!this.validateId(courseId)) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    // check current user's authorship of the parent course
    const course = await this.courseGateway.get(courseId);
    if (!course) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    if (seqNum && seqNum > course.weekIds.length) {
      throw new BadRequestError(
        `'seqNum' should be >= 0 and <= number of weeks in the parent course.`
      );
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    const week = await this.weekGateway.create(new Week({name, description}));

    this.emitter.emit(WEEK_CREATED, {course, week, seqNum});

    return new WeekResModel(
      week.id!,
      name,
      description,
      undefined,
      week.modifiedAt,
      week.createdAt
    );
  }

  private async getWeek(id: string) {
    if (!this.validateId(id)) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    const week = await this.weekGateway.get(id);
    if (!week) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    return week;
  }

  async get(currentUser: CurrentUser | null, id: string, queryParams: any) {
    const fields = this.getFieldsQuery(queryParams);

    const week = await this.getWeek(id);

    // get parent course
    const course = await this.courseGateway.getByWeekId(id);
    if (!course) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    const {name, description, steps, modifiedAt, createdAt} = fields
      ? ObjectsHelper.projection(week, fields)
      : week;

    if (currentUser && currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(WEEK_NOT_FOUND);
      }

      return new WeekResModel(
        id,
        name,
        description,
        steps,
        modifiedAt,
        createdAt
      );
    }

    if (!course.isPublished) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    return new WeekResModel(id, name, description, steps);
  }

  async getGradedSteps(
    currentUser: CurrentUser | null,
    id: string,
    queryParams: any
  ) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const fields = this.getFieldsQuery(queryParams);

    const week = await this.getWeek(id);

    // check current user's enrollment in the parent course
    const course = await this.courseGateway.getByWeekId(id);
    if (!course) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    if (!course.isPublished) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    const enrollment = await this.enrollmentGateway.get(
      course.id!,
      currentUser!.id
    );
    if (!enrollment) {
      throw new ForbiddenError();
    }

    return await Promise.all(
      week.steps
        .filter(stepRef => stepRef.stepCategory === StepCategories.QUIZ)
        .map(async stepRef => {
          const finishedStep = await this.finishedStepGateway.get(
            currentUser!.id,
            stepRef
          );
          const {stepCategory, stepId} = stepRef;
          if (!finishedStep) {
            const quiz = await this.quizGateway.get(stepRef.stepId);
            if (!quiz) {
              throw new DataIntegrityError(QUIZ_NOT_FOUND);
            }

            const {availableScore} = fields
              ? ObjectsHelper.projection(quiz, fields)
              : quiz;

            return fields
              ? new GradedStepResModel(
                  fields.includes('stepCategory') ? stepCategory : undefined,
                  fields.includes('stepId') ? stepId : undefined,
                  availableScore
                )
              : new GradedStepResModel(stepCategory, stepId, availableScore);
          }

          const finalQuizAttempt = await this.quizAttemptGateway.get(
            currentUser!.id,
            stepId
          );
          if (!finalQuizAttempt) {
            throw new DataIntegrityError(QUIZ_ATTEMPT_NOT_FOUND);
          }

          const {availableScore, score, createdAt} = fields
            ? ObjectsHelper.projection(finalQuizAttempt, fields)
            : finalQuizAttempt;

          return fields
            ? new FinishedGradedStepResModel(
                score,
                createdAt,
                fields.includes('stepCategory') ? stepCategory : undefined,
                fields.includes('stepId') ? stepId : undefined,
                availableScore
              )
            : new FinishedGradedStepResModel(
                score,
                createdAt,
                stepCategory,
                stepId,
                availableScore
              );
        })
    );
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateWeekReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const week = await this.getWeek(id);

    // check current user's authorship of the parent course
    const course = await this.courseGateway.getByWeekId(id);
    if (!course) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    const {seqNum} = reqModel;
    if (seqNum && seqNum > course.weekIds.length) {
      throw new BadRequestError(
        `'seqNum' should be >= 0 and <= number of weeks in the parent course.`
      );
    }

    const updatedWeek = await this.weekGateway.update(
      week.update({name: reqModel.name, description: reqModel.description})
    );
    if (!updatedWeek) {
      throw new DataIntegrityError(WEEK_NOT_FOUND);
    }

    this.emitter.emit(WEEK_UPDATED, {course, week, seqNum});

    const {name, description, steps, modifiedAt, createdAt} = updatedWeek;

    return new WeekResModel(
      id,
      name,
      description,
      steps,
      modifiedAt,
      createdAt
    );
  }

  async delete(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, [UserRoles.ADMIN, UserRoles.AUTHOR]);

    const course = await this.courseGateway.getByWeekId(id);
    if (!course) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    if (currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(WEEK_NOT_FOUND);
      }

      if (course.isPublished) {
        throw new ForbiddenError();
      }
    }

    const week = await this.getWeek(id);

    this.emitter.emit(WEEK_DELETED, week);

    const {name, description, steps, createdAt} = week;

    return new WeekResModel(id, name, description, steps, undefined, createdAt);
  }
}
