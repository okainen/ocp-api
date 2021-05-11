import Joi from 'joi';
import {BadRequestError} from '@/errors';
import { INVALID_INPUT } from '@/constants/errors';

export default class UpdateWeek {
  public readonly seqNum?: number;
  public readonly name?: string;
  public readonly description?: string;

  constructor(reqBody: any) {
    const schema = Joi.object({
      seqNum: Joi.number().min(0),
      name: Joi.string().min(5).max(128),
      description: Joi.string()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.seqNum = Number(reqBody.seqNum);
    this.name = reqBody.name;
    this.description = reqBody.description;
  }
}
