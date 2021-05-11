import {QuestionOption} from '@/entities/valueObjects';
import SingleChoiceQuestion from '../singleChoiceQuestion/SingleChoiceQuestion';

export default class AnsweredSingleChoiceQuestion extends SingleChoiceQuestion {
  constructor(
    id?: string,
    description?: string,
    availableScore?: number,
    options?: QuestionOption[],
    public readonly correctOption?: string,
    public readonly choice?: string,
    public readonly score?: number
  ) {
    super(id, description, availableScore, options);
  }
}
