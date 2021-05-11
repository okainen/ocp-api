import {CurrentUser} from '@/entities/valueObjects';
import {
  CreateMultiChoiceQuestionReqModel,
  UpdateMultiChoiceQuestionReqModel
} from '@/requestModels';
import {MultiChoiceQuestionResModel} from '@/responseModels/multiChoiceQuestion';

export default interface IMultiChoiceQuestionService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateMultiChoiceQuestionReqModel
  ) => Promise<MultiChoiceQuestionResModel>;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateMultiChoiceQuestionReqModel
  ) => Promise<MultiChoiceQuestionResModel>;

  delete: (
    currentUser: CurrentUser | null,
    id: string
  ) => Promise<MultiChoiceQuestionResModel>;
}
