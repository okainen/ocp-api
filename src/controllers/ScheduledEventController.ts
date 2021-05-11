import {Request, Response} from 'express';
import {
  CreateScheduledEventReqModel,
  UpdateScheduledEventReqModel
} from '@/requestModels';
import {toJson} from './helpers';
import IScheduledEventService from '@/interfaces/services/IScheduledEventService';

export default class ScheduledEventController {
  constructor(private scheduledEventService: IScheduledEventService) {}

  create = async (req: Request, res: Response) => {
    const resModel = await this.scheduledEventService.create(
      req.currentUser!,
      new CreateScheduledEventReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  get = async (req: Request, res: Response) => {
    const resModel = await this.scheduledEventService.get(
      req.currentUser!,
      req.params.id
    );
    res.status(200).json(toJson(resModel));
  };

  getAll = async (req: Request, res: Response) => {
    const resModel = await this.scheduledEventService.getAll(
      req.currentUser!,
      req.query
    );
    res.status(200).json(toJson(resModel));
  };

  update = async (req: Request, res: Response) => {
    const resModel = await this.scheduledEventService.update(
      req.currentUser!,
      req.params.id,
      new UpdateScheduledEventReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };

  delete = async (req: Request, res: Response) => {
    const resModel = await this.scheduledEventService.delete(
      req.currentUser!,
      req.params.id
    );
    res.status(204).json(toJson(resModel));
  };
}
