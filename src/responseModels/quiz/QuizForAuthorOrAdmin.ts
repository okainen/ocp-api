import Question from '../Question';
import Quiz from './Quiz';

export default class QuizForAuthorOrAdmin extends Quiz {
  constructor(
    id?: string,
    name?: string,
    public readonly questions?: Question[],
    estimatedEffort?: number,
    availableScore?: number,
    public readonly modifiedAt?: Date,
    public readonly createdAt?: Date
  ) {
    super(id, name, estimatedEffort, availableScore);
  }
}
