import {QuestionResponse} from '.';
import {SingleChoiceQuestion} from '.';

export default class SingleChoiceQuestionResponse extends QuestionResponse {
  public readonly question: SingleChoiceQuestion;
  public readonly choice: string;

  constructor({
    id,
    question,
    choice
  }: {
    id?: string;
    question: SingleChoiceQuestion;
    choice: string;
  }) {
    super({id});
    if (![...question.options].map(option => option.id).includes(choice)) {
      this.question = question;
      this.choice = choice;
    } else {
      throw new Error();
    }
  }

  update(choice: string): SingleChoiceQuestionResponse {
    return new SingleChoiceQuestionResponse({
      id: this.id,
      question: this.question,
      choice
    });
  }

  get score() {
    const {correctOption, availableScore} = this.question;
    return this.choice === correctOption ? availableScore : 0;
  }
}
