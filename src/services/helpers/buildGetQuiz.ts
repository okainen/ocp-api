import {QUIZ_NOT_FOUND} from '@/constants/errors';
import {NotFoundError} from '@/errors';
import {IQuizGateway} from '@/interfaces/gateways';
import {validateId} from './interfaces';

export default (quizGateway: IQuizGateway, validateId: validateId) => {
  return async (id: string) => {
    if (!validateId(id)) {
      throw new NotFoundError(QUIZ_NOT_FOUND);
    }

    const quiz = await quizGateway.get(id);
    if (!quiz) {
      throw new NotFoundError(QUIZ_NOT_FOUND);
    }

    return quiz;
  };
};
