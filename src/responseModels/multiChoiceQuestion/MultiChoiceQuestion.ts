import {QuestionCategories} from '@/entities/enums';
import {QuestionOption} from '@/entities/valueObjects';
import Question from '../Question';

export default class MultiChoiceQuestion extends Question {
  public readonly category = QuestionCategories.MULTI_CHOICE;
  constructor(
    id?: string,
    description?: string,
    availableScore?: number,
    public readonly options?: QuestionOption[]
  ) {
    super(id, description, availableScore);
  }
}
