import {CurrentUser} from '@/entities/valueObjects';
import {
  CreateCourseCategoryReqModel,
  UpdateCourseCategoryReqModel
} from '@/requestModels';
import {CourseCategoryResModel} from '@/responseModels';

export default interface ICourseCategoryService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateCourseCategoryReqModel
  ) => Promise<CourseCategoryResModel>;

  get: (
    currentUser: CurrentUser | null,
    id: string,
    queryParams: any
  ) => Promise<CourseCategoryResModel>;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateCourseCategoryReqModel
  ) => Promise<CourseCategoryResModel>;
}
