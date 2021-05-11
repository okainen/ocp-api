export default abstract class Question {
  public readonly id?: string;
  public readonly description: string;
  public readonly availableScore: number;
  public readonly createdAt: Date;

  constructor({
    id,
    description,
    availableScore,
    createdAt
  }: {
    id?: string;
    description: string;
    availableScore: number;
    createdAt?: Date;
  }) {
    this.id = id;
    this.description = description;
    this.availableScore = availableScore;

    const now: Date = new Date();
    this.createdAt = createdAt || now;
  }

  public isEqual(question: Question) {
    return this.constructor === question.constructor && this.id === question.id;
  }
}
