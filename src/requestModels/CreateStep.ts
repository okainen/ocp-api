import Joi from 'joi';
import {BadRequestError} from '@/errors';
import { INVALID_INPUT } from '@/constants/errors';

export default class CreatesStep {
  public readonly weekId: string;
  public readonly seqNum: number;
  public readonly name: string;
  public readonly estimatedEffort: number;

  constructor(reqBody: any) {
    const schema = Joi.object({
      weekId: Joi.string().min(1).required(),
      seqNum: Joi.number().min(0),
      name: Joi.string().min(5).max(128).required(),
      estimatedEffort: Joi.number().min(1).required()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.weekId = reqBody.weekId;
    this.seqNum = Number(reqBody.seqNum);
    this.name = reqBody.name;
    this.estimatedEffort = reqBody.estimatedEffort;
  }
}
