import {QuestionResponse} from '.';
import {MultiChoiceQuestion} from '.';
import {SetsHelper} from '@/helpers';

export default class MultiChoiceQuestionResponse extends QuestionResponse {
  public readonly question: MultiChoiceQuestion;
  public readonly choice: Set<string>;

  constructor({
    id,
    question,
    choice
  }: {
    id?: string;
    question: MultiChoiceQuestion;
    choice: string[];
  }) {
    super({id});
    this.question = question;
    this.choice = new Set(choice);
  }

  update(choice: string[]): MultiChoiceQuestionResponse {
    return new MultiChoiceQuestionResponse({
      id: this.id,
      question: this.question,
      choice
    });
  }

  get score() {
    const {correctOption, availableScore} = this.question;
    return new SetsHelper().compareSets(this.choice, correctOption)
      ? availableScore
      : 0;
  }
}
