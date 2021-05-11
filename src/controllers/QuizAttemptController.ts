import {Request, Response} from 'express';
import {QuizAttemptReqModel} from '@/requestModels';
import {toJson} from './helpers';
import {IQuizAttemptService} from '@/interfaces/services';

export default class QuizAttemptController {
  constructor(private quizAttemptService: IQuizAttemptService) {}

  get = async (req: Request, res: Response) => {
    const resModel = await this.quizAttemptService.get(
      req.currentUser!,
      req.params.quizId,
      req.query
    );
    res.status(200).json(toJson(resModel));
  };

  submit = async (req: Request, res: Response) => {
    const resModel = await this.quizAttemptService.submit(
      req.currentUser!,
      req.params.quizId,
      new QuizAttemptReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  save = async (req: Request, res: Response) => {
    const resModel = await this.quizAttemptService.save(
      req.currentUser!,
      req.params.quizId,
      new QuizAttemptReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };
}
