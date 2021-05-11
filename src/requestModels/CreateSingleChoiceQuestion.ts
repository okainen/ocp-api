import Joi from 'joi';
import {BadRequestError} from '@/errors';
import { INVALID_INPUT } from '@/constants/errors';

export default class CreateSingleChoiceQuestion {
  public readonly quizId: string;
  public readonly seqNum: number;
  public readonly description: string;
  public readonly options: string[];
  public readonly correctOption: number;
  public readonly availableScore: number;

  constructor(reqBody: any) {
    const schema = Joi.object({
      quizId: Joi.string().min(1).required(),
      seqNum: Joi.number().min(0),
      description: Joi.string().required(),
      options: Joi.array().items(Joi.string()).required(),
      correctOption: Joi.number().min(0).required(),
      availableScore: Joi.number().required()
    });
    if (schema.validate(reqBody).error) {
      throw new BadRequestError(INVALID_INPUT);
    }

    this.quizId = reqBody.quizId;
    this.seqNum = Number(reqBody.seqNum);
    this.description = reqBody.description;
    this.options = reqBody.options;
    this.correctOption = Number(reqBody.correctOption);
    this.availableScore = Number(reqBody.availableScore);
  }
}
