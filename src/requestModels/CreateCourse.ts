import Joi from 'joi';
import {BadRequestError} from '@/errors';
import { INVALID_INPUT } from '@/constants/errors';

export default class CreateCourse {
  public readonly name: string;
  public readonly description: string;
  public readonly categoryIds: string[];
  public readonly isPublished: boolean = false;

  constructor(reqBody: any) {
    const schema = Joi.object({
      name: Joi.string().min(5).max(128).required(),
      description: Joi.string().required(),
      categoryIds: Joi.array().items().min(1).required(),
      isPublished: Joi.boolean()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.name = reqBody.name;
    this.description = reqBody.description;
    this.categoryIds = reqBody.categoryIds;
    this.isPublished = reqBody.isPublished;
  }
}
