import {QuestionCategories} from '../enums';

export default class QuestionResponseRef {
  constructor(
    public readonly questionResponseId: string,
    public readonly questionCategory: QuestionCategories
  ) {}
}
