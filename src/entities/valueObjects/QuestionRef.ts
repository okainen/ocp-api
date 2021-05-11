import {QuestionCategories} from '../enums';

export default class QuestionRef {
  constructor(
    public readonly questionId: string,
    public readonly questionCategory: QuestionCategories
  ) {}
}
