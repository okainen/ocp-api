import {Request, Response} from 'express';
import {
  CreateCourseCategoryReqModel,
  UpdateCourseCategoryReqModel
} from '@/requestModels';
import {toJson} from './helpers';
import {ICourseCategoryService} from '@/interfaces/services';

export default class CourseCategoryController {
  constructor(private courseCategoryService: ICourseCategoryService) {}

  get = async (req: Request, res: Response) => {
    const resModel = await this.courseCategoryService.get(
      req.currentUser!,
      req.params.id,
      req.query
    );
    res.status(200).json(toJson(resModel));
  };

  create = async (req: Request, res: Response) => {
    const resModel = await this.courseCategoryService.create(
      req.currentUser!,
      new CreateCourseCategoryReqModel(req.body)
    );
    res.status(201).json(toJson(resModel));
  };

  update = async (req: Request, res: Response) => {
    const resModel = await this.courseCategoryService.update(
      req.currentUser!,
      req.params.id,
      new UpdateCourseCategoryReqModel(req.body)
    );
    res.status(200).json(toJson(resModel));
  };
}
