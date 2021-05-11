import {Request, Response} from 'express';
import {CreateWeekReqModel, UpdateWeekReqModel} from '@/requestModels';
import {toJson} from './helpers';
import {IWeekService} from '@/interfaces/services';

export default class WeekController {
  constructor(private weekService: IWeekService) {}

  create = async (req: Request, res: Response) => {
    const resModel = await this.weekService.create(
      req.currentUser!,
      new CreateWeekReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  get = async (req: Request, res: Response) => {
    const resModel = await this.weekService.get(
      req.currentUser!,
      req.params.id,
      req.query
    );
    res.status(200).json(toJson(resModel));
  };

  // getGrades = async (req: Request, res: Response) => {
  //   const resModel = await this.weekService.getGrades(
  //     req.currentUser!,
  //     req.params.id,
  //     req.query
  //   );
  //   res.status(200).json(toJson(resModel));
  // };

  update = async (req: Request, res: Response) => {
    const resModel = await this.weekService.update(
      req.currentUser!,
      req.params.id,
      new UpdateWeekReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };

  delete = async (req: Request, res: Response) => {
    const resModel = await this.weekService.delete(req.currentUser!, req.params.id);
    res.status(204).json(toJson(resModel));
  };
}
