import {QuestionCategories} from '@/entities/enums';
import {QuestionOption} from '@/entities/valueObjects';
import Question from '../Question';

export default class SingleChoiceQuestion extends Question {
  public readonly category = QuestionCategories.SINGLE_CHOICE;
  constructor(
    id?: string,
    description?: string,
    availableScore?: number,
    public readonly options?: QuestionOption[],
  ) {
    super(id, description, availableScore);
  }
}
