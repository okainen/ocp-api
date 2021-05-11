import {EventEmitter} from 'events';
import {QUIZ_DELETED} from '@/constants/events';
import {IQuizAttemptGateway} from '../interfaces/gateways';
import {Quiz} from '@/entities';

export default (
  quizAttemptGateway: IQuizAttemptGateway,
  emitter: EventEmitter
) => {
  emitter.on(QUIZ_DELETED, async (quiz: Quiz) => {
    await quizAttemptGateway.deleteByQuizId(quiz.id!);
  });
};
