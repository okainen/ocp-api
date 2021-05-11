import Joi from 'joi';
import {BadRequestError} from '@/errors';
import { INVALID_INPUT } from '@/constants/errors';

export default class UpdateStep {
  public readonly seqNum?: number;
  public readonly name?: string;
  public readonly estimatedEffort?: number;

  constructor(reqBody: any) {
    const schema = Joi.object({
      seqNum: Joi.number().min(0),
      name: Joi.string().min(5).max(128),
      estimatedEffort: Joi.number().min(1)
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.seqNum = Number(reqBody.seqNum);
    this.name = reqBody.name;
    this.estimatedEffort = reqBody.estimatedEffort;
  }
}
