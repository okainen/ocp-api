import {CurrentUser} from '@/entities/valueObjects';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {ReadingResModel} from '@/responseModels/reading';

export default interface IReadingService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateStepReqModel
  ) => Promise<ReadingResModel>;

  get: (
    currentUser: CurrentUser | null,
    id: string,
    queryParams: any
  ) => Promise<ReadingResModel>;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateStepReqModel
  ) => Promise<ReadingResModel>;

  uploadDoc: (
    currentUser: CurrentUser | null,
    id: string,
    videoPath: string
  ) => Promise<ReadingResModel>;

  delete: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<ReadingResModel>;
}
