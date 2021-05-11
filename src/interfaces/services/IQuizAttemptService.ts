import {CurrentUser} from '@/entities/valueObjects';
import {QuizAttemptReqModel} from '@/requestModels';
import {QuizAttemptResModel} from '@/responseModels/quizAttempt';

export default interface IQuizAttemptService {
  submit: (
    currentUser: CurrentUser | null,
    quizId: string,
    reqModel: QuizAttemptReqModel
  ) => Promise<QuizAttemptResModel>;

  get: (
    currentUser: CurrentUser | null,
    quizId: string,
    queryParams: any
  ) => Promise<QuizAttemptResModel>;

  save: (
    currentUser: CurrentUser | null,
    quizId: string,
    reqModel: QuizAttemptReqModel
  ) => Promise<QuizAttemptResModel>;
}
