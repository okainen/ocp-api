import {Request, Response} from 'express';
import {CreateCourseReqModel, UpdateCourseReqModel} from '@/requestModels';
import {toJson} from './helpers';
import config from '@/config';
import {ICourseService} from '@/interfaces/services';

export default class CourseController {
  constructor(private courseService: ICourseService) {}

  get = async (req: Request, res: Response) => {
    const resModel = await this.courseService.get(
      req.currentUser!,
      req.params.id,
      req.query
    );
    res.status(200).json(toJson(resModel));
  };

  getAll = async (req: Request, res: Response) => {
    const resModels = await this.courseService.getAll(
      req.currentUser!,
      req.query
    );
    res.status(200).json(toJson(resModels));
  };

  create = async (req: Request, res: Response) => {
    const resModel = await this.courseService.create(
      req.currentUser!,
      new CreateCourseReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  update = async (req: Request, res: Response) => {
    const resModel = await this.courseService.update(
      req.currentUser!,
      req.params.id,
      new UpdateCourseReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };

  uploadImg = async (req: Request, res: Response) => {
    const {
      app: {
        hostname,
        port,
        users: {imgDir}
      }
    } = config;
    const resModel = await this.courseService.uploadImg(
      req.currentUser,
      req.params.id,
      `${hostname}:${port}/${imgDir}/${req.file.filename}`
    );
    res.status(200).json(toJson(resModel));
  };

  delete = async (req: Request, res: Response) => {
    const resModel = await this.courseService.delete(
      req.currentUser!,
      req.params.id
    );
    res.status(204).json(toJson(resModel));
  };

  enroll = async (req: Request, res: Response) => {
    const resModel = await this.courseService.enroll(
      req.currentUser!,
      req.params.id
    );
    res.status(200).json(toJson(resModel));
  };

  unenroll = async (req: Request, res: Response) => {
    const resModel = await this.courseService.unenroll(
      req.currentUser!,
      req.params.id
    );
    res.status(200).json(toJson(resModel));
  };
}
