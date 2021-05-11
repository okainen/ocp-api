import {QuestionOption} from '@/entities/valueObjects';
import SingleChoiceQuestion from './SingleChoiceQuestion';

export default class SingleChoiceQuestionForAuthorOrAdmin extends SingleChoiceQuestion {
  constructor(
    id?: string,
    description?: string,
    availableScore?: number,
    options?: QuestionOption[],
    public readonly correctOption?: string
  ) {
    super(id, description, availableScore, options);
  }
}
