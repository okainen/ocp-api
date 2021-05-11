import Joi from 'joi';
import {ScheduledEvent} from '@/entities';
import {CurrentUser} from '@/entities/valueObjects';
import {StepCategories, TimePeriods, UserRoles} from '@/entities/enums';
import {BadRequestError, DataIntegrityError, NotFoundError} from '@/errors';
import {
  IEnrollmentGateway,
  IScheduledEventGateway
} from '@/interfaces/gateways';
import {
  CreateScheduledEventReqModel,
  UpdateScheduledEventReqModel
} from '@/requestModels';
import {ScheduledEventResModel} from '../responseModels';
import {
  INVALID_QUERY_PARAMS,
  LECTURE_NOT_FOUND,
  QUIZ_NOT_FOUND,
  READING_NOT_FOUND,
  SCHEDULED_EVENT_NOT_FOUND,
  STEP_NOT_FOUND
} from '@/constants/errors';
import IScheduledEventService from '@/interfaces/services/IScheduledEventService';
import {authorizeUser, getStepLineage, validateId} from './helpers/interfaces';

export default class ScheduledEventService implements IScheduledEventService {
  constructor(
    private scheduledEventGateway: IScheduledEventGateway,
    private enrollmentGateway: IEnrollmentGateway,
    private authorizeUser: authorizeUser,
    private validateId: validateId,
    private getStepLineage: getStepLineage
  ) {}

  async create(
    currentUser: CurrentUser | null,
    reqModel: CreateScheduledEventReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const {stepRef, timespan} = reqModel;
    if (!this.validateId(stepRef.stepId)) {
      throw new NotFoundError(STEP_NOT_FOUND);
    }

    const {course} = await this.getStepLineage(stepRef);
    if (!(await this.enrollmentGateway.get(course.id!, currentUser!.id))) {
      switch (stepRef.stepCategory) {
        case StepCategories.LECTURE:
          throw new NotFoundError(LECTURE_NOT_FOUND);
        case StepCategories.READING:
          throw new NotFoundError(READING_NOT_FOUND);
        default:
          throw new NotFoundError(QUIZ_NOT_FOUND);
      }
    }

    return this.scheduledEventGateway.create(
      new ScheduledEvent({studentId: currentUser!.id, stepRef, timespan})
    );
  }

  async get(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    if (!this.validateId(id)) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }

    const scheduledEvent = await this.scheduledEventGateway.get(id);
    if (!scheduledEvent) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }
    if (scheduledEvent.studentId !== currentUser!.id) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }

    const {stepRef, timespan} = scheduledEvent;
    return new ScheduledEventResModel(id, stepRef, timespan);
  }

  async getAll(currentUser: CurrentUser | null, queryParams: any) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const querySchema = Joi.object({
      period: Joi.string().valid(
        TimePeriods.DAY,
        TimePeriods.WEEK,
        TimePeriods.MONTH
      ),
      date: Joi.date()
    });

    if (querySchema.validate(queryParams).error) {
      throw new BadRequestError(INVALID_QUERY_PARAMS);
    }

    const period = queryParams.period ? queryParams.period : TimePeriods.DAY;
    const date = queryParams.date ? queryParams.date : new Date();

    switch (period) {
      case TimePeriods.DAY:
        return this.scheduledEventGateway.getAllByDay(currentUser!.id, date);
      case TimePeriods.WEEK:
        return this.scheduledEventGateway.getAllByWeek(currentUser!.id, date);
      default:
        return this.scheduledEventGateway.getAllByMonth(currentUser!.id, date);
    }
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateScheduledEventReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    if (!this.validateId(id)) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }

    const scheduledEvent = await this.scheduledEventGateway.get(id);
    if (!scheduledEvent) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }
    if (scheduledEvent.studentId !== currentUser!.id) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }

    const {stepRef, timespan} = reqModel;
    const updatedScheduledEvent = await this.scheduledEventGateway.update(
      scheduledEvent.update({stepRef, timespan})
    );
    if (!updatedScheduledEvent) {
      throw new DataIntegrityError(SCHEDULED_EVENT_NOT_FOUND);
    }

    return updatedScheduledEvent;
  }

  async delete(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    if (!this.validateId(id)) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }

    const scheduledEvent = await this.scheduledEventGateway.get(id);
    if (!scheduledEvent) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }
    if (scheduledEvent.studentId !== currentUser!.id) {
      throw new NotFoundError(SCHEDULED_EVENT_NOT_FOUND);
    }

    const deletedScheduledEvent = await this.scheduledEventGateway.delete(id);
    if (!deletedScheduledEvent) {
      throw new DataIntegrityError(SCHEDULED_EVENT_NOT_FOUND);
    }

    return deletedScheduledEvent;
  }
}
