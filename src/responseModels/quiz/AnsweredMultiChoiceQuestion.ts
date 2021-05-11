import {QuestionOption} from '@/entities/valueObjects';
import MultiChoiceQuestion from '../multiChoiceQuestion/MultiChoiceQuestion';

export default class AnsweredMultiChoiceQuestion extends MultiChoiceQuestion {
  constructor(
    id?: string,
    description?: string,
    availableScore?: number,
    options?: QuestionOption[],
    public readonly correctOption?: string[],
    public readonly choice?: string[],
    public readonly score?: number
  ) {
    super(id, description, availableScore, options);
  }
}
