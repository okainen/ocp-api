import {CurrentUser} from '@/entities/valueObjects';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {LectureResModel} from '@/responseModels/lecture';

export default interface ILectureService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateStepReqModel
  ) => Promise<LectureResModel>;

  get: (
    currentUser: CurrentUser | null,
    id: string,
    queryParams: any
  ) => Promise<LectureResModel>;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateStepReqModel
  ) => Promise<LectureResModel>;

  uploadVideo: (
    currentUser: CurrentUser | null,
    id: string,
    videoPath: string
  ) => Promise<LectureResModel>;

  delete: (currentUser: CurrentUser | null, id: string) => Promise<LectureResModel>;
}
