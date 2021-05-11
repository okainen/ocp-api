import {CurrentUser} from '@/entities/valueObjects';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {
  QuizResModel,
  QuizForAuthorOrAdminResModel,
  QuizForStudentResModel,
  FinishedQuizResModel
} from '@/responseModels/quiz';

export default interface IQuizService {
  create: (
    currentUser: CurrentUser | null,
    reqModel: CreateStepReqModel
  ) => Promise<QuizForAuthorOrAdminResModel>;

  get: (
    currentUser: CurrentUser | null,
    id: string,
    queryParams: any
  ) => Promise<
    | QuizResModel
    | QuizForAuthorOrAdminResModel
    | QuizForStudentResModel
    | FinishedQuizResModel
  >;

  update: (
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateStepReqModel
  ) => Promise<QuizForAuthorOrAdminResModel>;

  delete: (currentUser: CurrentUser | null, id: string) => Promise<QuizResModel>;
}
