import {Request, Response} from 'express';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {toJson} from './helpers';
import config from '@/config';
import {IReadingService} from '@/interfaces/services';

const {
  app: {
    hostname,
    port,
    readings: {docDir}
  }
} = config;

export default class ReadingController {
  constructor(private readingService: IReadingService) {}

  create = async (req: Request, res: Response) => {
    const resModel = await this.readingService.create(
      req.currentUser!,
      new CreateStepReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  get = async (req: Request, res: Response) => {
    const resModel = await this.readingService.get(
      req.currentUser!,
      req.params.id,
      req.query
    );
    res.status(200).json(toJson(resModel));
  };

  update = async (req: Request, res: Response) => {
    const resModel = await this.readingService.update(
      req.currentUser!,
      req.params.id,
      new UpdateStepReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };

  uploadDoc = async (req: Request, res: Response) => {
    const resModel = await this.readingService.uploadDoc(
      req.currentUser,
      req.params.id,
      `${hostname}:${port}/${docDir}/${req.file.filename}`
    );
    res.status(200).json(toJson(resModel));
  };

  delete = async (req: Request, res: Response) => {
    const resModel = await this.readingService.delete(
      req.currentUser!,
      req.params.id
    );
    res.status(204).json(toJson(resModel));
  };
}
