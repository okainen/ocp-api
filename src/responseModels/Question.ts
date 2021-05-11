import {QuestionCategories} from '@/entities/enums';

export default abstract class Question {
  public abstract readonly category: QuestionCategories;
  constructor(
    public readonly id?: string,
    public readonly description?: string,
    public readonly availableScore?: number
  ) {}
}
