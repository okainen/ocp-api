import Joi from 'joi';
import {BadRequestError} from '@/errors';
import {QuestionResponse} from './types';
import { INVALID_INPUT } from '@/constants/errors';

export default class CreateQuizAttempt {
  public readonly response: (QuestionResponse | null)[];

  constructor(reqBody: any) {
    const schema = Joi.object({
      response: Joi.array()
        .items(
          Joi.alternatives().try(
            Joi.object({
              choice: Joi.string().required()
            }),
            Joi.object({
              choice: Joi.array().items(Joi.string()).required()
            }),
            Joi.object({})
          )
        )
        .required()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.response = reqBody.response.map((item: any) => {
      if (!(item as QuestionResponse).choice) {
        return null;
      }

      return item;
    });
  }
}
