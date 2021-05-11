import {Quiz} from '@/entities';
import {QuestionRef} from '@/entities/valueObjects';

export default interface IQuizGateway {
  create: (quiz: Quiz) => Promise<Quiz>;
  get: (id: string) => Promise<Quiz | null>;
  getByQuestionRef: (questionRef: QuestionRef) => Promise<Quiz | null>;
  update: (quiz: Quiz) => Promise<Quiz | null>;
  delete: (id: string) => Promise<Quiz | null>;
}
