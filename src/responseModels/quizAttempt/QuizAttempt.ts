import MultiChoiceQuestionResponse from './MultiChoiceQuestionResponse';
import SingleChoiceQuestionResponse from './SingleChoiceQuestionResponse';

export default class QuizAttempt {
  constructor(
    public readonly response?: (
      | SingleChoiceQuestionResponse
      | MultiChoiceQuestionResponse
      | {}
    )[],
    public readonly isFinal = false,
    public readonly createdAt?: Date
  ) {}
}
