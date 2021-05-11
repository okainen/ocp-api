import {Question, Step} from '.';

export default class Quiz extends Step {
  public readonly questions: Question[];

  constructor({
    id,
    name,
    estimatedEffort,
    questions,
    modifiedAt,
    createdAt
  }: {
    id?: string;
    name: string;
    estimatedEffort: number;
    questions?: Question[];
    modifiedAt?: Date;
    createdAt?: Date;
  }) {
    super({id, name, estimatedEffort, modifiedAt, createdAt});
    this.questions = questions || [];
  }

  update = ({
    name,
    estimatedEffort,
    questions
  }: {
    name?: string;
    estimatedEffort?: number;
    questions?: Question[];
  }) =>
    new Quiz({
      id: this.id,
      name: name || this.name,
      estimatedEffort: estimatedEffort || this.estimatedEffort,
      questions: questions || this.questions,
      createdAt: this.createdAt
    });

  get availableScore() {
    return this.questions
      .map(question => question.availableScore)
      .reduce((acc, curr) => acc + curr, 0);
  }
}
