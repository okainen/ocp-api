import {QuestionOption} from '@/entities/valueObjects';
import MultiChoiceQuestion from './MultiChoiceQuestion';

export default class MultiChoiceQuestionForAuthorOrAdmin extends MultiChoiceQuestion {
  constructor(
    id?: string,
    description?: string,
    availableScore?: number,
    options?: QuestionOption[],
    public readonly correctOption?: string[]
  ) {
    super(id, description, availableScore, options);
  }
}
