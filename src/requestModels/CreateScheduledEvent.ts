import Joi from 'joi';
import {BadRequestError} from '@/errors';
import {StepRef, Timespan} from '@/entities/valueObjects';
import {StepCategories} from '@/entities/enums';
import { INVALID_INPUT } from '@/constants/errors';

export default class CreateScheduledEvent {
  public readonly stepRef: StepRef;
  public readonly timespan: Timespan;

  constructor(reqBody: any) {
    const schema = Joi.object({
      stepRef: Joi.object({
        stepCategory: Joi.string()
          .valid(
            StepCategories.LECTURE,
            StepCategories.READING,
            StepCategories.QUIZ
          )
          .required(),
        stepId: Joi.string().required()
      }).required(),
      timespan: Joi.object({
        beginning: Joi.date().required(),
        end: Joi.date().required()
      }).required()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    const {stepRef, timespan} = reqBody;
    this.stepRef = stepRef;

    const timespanMillis = timespan.end - timespan.beginning;
    if (timespanMillis < 60 * 1000 || timespanMillis > 60 * 1000 * 60 * 4) {
      throw new BadRequestError(INVALID_INPUT);
    }
    this.timespan = timespan;
  }
}
