import Joi from 'joi';
import {BadRequestError} from '@/errors';
import { INVALID_INPUT } from '@/constants/errors';

export default class UpdateMultiChoiceQuestion {
  public readonly seqNum?: number;
  public readonly description?: string;
  public readonly options?: string[];
  public readonly correctOption?: number[];
  public readonly availableScore?: number;

  constructor(reqBody: any) {
    const schema = Joi.object({
      seqNum: Joi.number().min(0),
      description: Joi.string(),
      options: Joi.array().items(Joi.string()),
      correctOption: Joi.array().items(Joi.number().min(0)),
      availableScore: Joi.number()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.seqNum = Number(reqBody.seqNum);
    this.description = reqBody.description;
    this.options = reqBody.options;
    this.correctOption = reqBody.correctOption.map((i: string) => Number(i));
    this.availableScore = Number(reqBody.availableScore);
  }
}
