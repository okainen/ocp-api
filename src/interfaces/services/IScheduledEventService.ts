import {CurrentUser} from '@/entities/valueObjects';
import {
  CreateScheduledEventReqModel,
  UpdateScheduledEventReqModel
} from '@/requestModels';
import {ScheduledEventResModel} from '@/responseModels';

export default interface IScheduledEventService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateScheduledEventReqModel
  ) => Promise<ScheduledEventResModel>;

  get: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<ScheduledEventResModel>;

  getAll: (
    currentUser: CurrentUser | null,
    queryParams: any
  ) => Promise<ScheduledEventResModel[]>;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateScheduledEventReqModel
  ) => Promise<ScheduledEventResModel>;

  delete: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<ScheduledEventResModel>;
}
