import {Request, Response} from 'express';
import {
  CreateSingleChoiceQuestionReqModel,
  UpdateSingleChoiceQuestionReqModel
} from '@/requestModels';
import {toJson} from './helpers';
import {ISingleChoiceQuestionService} from '@/interfaces/services';

export default class SingleChoiceQuestionController {
  constructor(
    private singleChoiceQuestionService: ISingleChoiceQuestionService
  ) {}

  create = async (req: Request, res: Response) => {
    const resModel = await this.singleChoiceQuestionService.create(
      req.currentUser!,
      new CreateSingleChoiceQuestionReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  update = async (req: Request, res: Response) => {
    const resModel = await this.singleChoiceQuestionService.update(
      req.currentUser!,
      req.params.id,
      new UpdateSingleChoiceQuestionReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };

  delete = async (req: Request, res: Response) => {
    const resModel = await this.singleChoiceQuestionService.delete(
      req.currentUser!,
      req.params.id
    );
    res.status(204).json(toJson(resModel));
  };
}
