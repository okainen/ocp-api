import Joi from 'joi';
import {BadRequestError} from '@/errors';
import { INVALID_INPUT } from '@/constants/errors';

export default class CreateWeek {
  public readonly courseId: string;
  public readonly seqNum: number;
  public readonly name: string;
  public readonly description: string;

  constructor(reqBody: any) {
    const schema = Joi.object({
      courseId: Joi.string().min(1).required(),
      seqNum: Joi.number().min(0),
      name: Joi.string().min(5).max(128).required(),
      description: Joi.string().required()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.courseId = reqBody.courseId;
    this.seqNum = Number(reqBody.seqNum);
    this.name = reqBody.name;
    this.description = reqBody.description;
  }
}
