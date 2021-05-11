import Question from '../Question';
import Quiz from './Quiz';

export default class QuizForStudent extends Quiz {
  constructor(
    id?: string,
    name?: string,
    public readonly questions?: Question[],
    estimatedEffort?: number,
    availableScore?: number
  ) {
    super(id, name, estimatedEffort, availableScore);
  }
}
