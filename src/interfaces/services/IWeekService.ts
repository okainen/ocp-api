import {CurrentUser} from '@/entities/valueObjects';
import {CreateWeekReqModel, UpdateWeekReqModel} from '@/requestModels';
import {GradedStepResModel, WeekResModel} from '@/responseModels';

export default interface IWeekService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateWeekReqModel
  ) => Promise<WeekResModel>;

  get: (
    currentUser: CurrentUser | null,
    id: string,
    queryParams: any
  ) => Promise<WeekResModel>;

  getGradedSteps: (
    currentUser: CurrentUser | null,
    id: string,
    queryParams: any
  ) => Promise<GradedStepResModel[]>;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateWeekReqModel
  ) => Promise<WeekResModel>;

  delete: (currentUser: CurrentUser | null, id: string) => Promise<WeekResModel>;
}
