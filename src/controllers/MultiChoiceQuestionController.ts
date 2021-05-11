import {Request, Response} from 'express';
import {
  CreateMultiChoiceQuestionReqModel,
  UpdateMultiChoiceQuestionReqModel
} from '@/requestModels';
import {toJson} from './helpers';
import {IMultiChoiceQuestionService} from '@/interfaces/services';

export default class MultiChoiceQuestionController {
  constructor(
    private multiChoiceQuestionService: IMultiChoiceQuestionService
  ) {}

  create = async (req: Request, res: Response) => {
    const resModel = await this.multiChoiceQuestionService.create(
      req.currentUser!,
      new CreateMultiChoiceQuestionReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  update = async (req: Request, res: Response) => {
    const resModel = await this.multiChoiceQuestionService.update(
      req.currentUser!,
      req.params.id,
      new UpdateMultiChoiceQuestionReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };

  delete = async (req: Request, res: Response) => {
    const resModel = await this.multiChoiceQuestionService.delete(
      req.currentUser!,
      req.params.id
    );
    res.status(204).json(toJson(resModel));
  };
}
