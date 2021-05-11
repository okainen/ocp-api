import Joi from 'joi';
import {BadRequestError} from '@/errors';
import { INVALID_INPUT } from '@/constants/errors';

export default class CreateCourseCategory {
  public readonly name: string;

  constructor(reqBody: any) {
    const schema = Joi.object({
      name: Joi.string().min(5).max(128).required()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.name = reqBody.name;
  }
}
