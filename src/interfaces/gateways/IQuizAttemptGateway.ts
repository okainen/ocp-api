import {QuizAttempt} from '@/entities';

export default interface IQuizAttemptGateway {
  create: (quizAttempt: QuizAttempt) => Promise<QuizAttempt>;
  get: (studentId: string, quizId: string) => Promise<QuizAttempt | null>;
  delete: (studentId: string, quizId: string) => Promise<QuizAttempt | null>;
  deleteByQuizId(quizId: string): Promise<QuizAttempt[] | null>;
}
