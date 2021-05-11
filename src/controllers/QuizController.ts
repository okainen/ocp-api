import {Request, Response} from 'express';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {toJson} from './helpers';
import {QuizService} from '@/services';

export default class QuizController {
  constructor(private quizService: QuizService) {}

  create = async (req: Request, res: Response) => {
    const resModel = await this.quizService.create(
      req.currentUser!,
      new CreateStepReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  get = async (req: Request, res: Response) => {
    const resModel = await this.quizService.get(
      req.currentUser!,
      req.params.id,
      req.query
    );
    res.status(200).json(toJson(resModel));
  };

  update = async (req: Request, res: Response) => {
    const resModel = await this.quizService.update(
      req.currentUser!,
      req.params.id,
      new UpdateStepReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };

  delete = async (req: Request, res: Response) => {
    const resModel = await this.quizService.delete(req.currentUser!, req.params.id);
    res.status(204).json(toJson(resModel));
  };
}
