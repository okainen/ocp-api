import {Question} from '.';
import {QuestionOption} from './valueObjects';

export default class SingleChoiceQuestion extends Question {
  public readonly options: Set<QuestionOption>;
  public readonly correctOption: string;

  constructor({
    id,
    description,
    options,
    correctOption,
    availableScore
  }: {
    id?: string;
    description: string;
    options: QuestionOption[];
    correctOption: string;
    availableScore: number;
  }) {
    super({id, description, availableScore});
    this.options = new Set(options);
    this.correctOption = correctOption;
  }

  update({
    description,
    options,
    correctOption,
    availableScore
  }: {
    description?: string;
    options?: QuestionOption[];
    correctOption?: string;
    availableScore?: number;
  }): SingleChoiceQuestion {
    return new SingleChoiceQuestion({
      id: this.id,
      description: description || this.description,
      options: options || [...this.options],
      correctOption: correctOption || this.correctOption,
      availableScore: availableScore || this.availableScore
    });
  }
}
