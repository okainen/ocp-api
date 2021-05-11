import {CurrentUser} from '@/entities/valueObjects';
import {
  CreateSingleChoiceQuestionReqModel,
  UpdateSingleChoiceQuestionReqModel
} from '@/requestModels';
import {SingleChoiceQuestionResModel} from '@/responseModels/singleChoiceQuestion';

export default interface ISingleChoiceQuestionService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateSingleChoiceQuestionReqModel
  ) => Promise<SingleChoiceQuestionResModel>;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateSingleChoiceQuestionReqModel
  ) => Promise<SingleChoiceQuestionResModel>;

  delete: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<SingleChoiceQuestionResModel>;
}
