import Question from '../Question';
import QuizForStudent from './QuizForStudent';

export default class FinishedQuiz extends QuizForStudent {
  constructor(
    id?: string,
    name?: string,
    questions?: Question[],
    estimatedEffort?: number,
    availableScore?: number,
    public readonly score?: number,
    public readonly finishedAt?: Date
  ) {
    super(id, name, questions, estimatedEffort, availableScore);
  }
}
