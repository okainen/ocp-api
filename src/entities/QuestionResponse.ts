export default abstract class QuestionResponse {
  public readonly id?: string;

  constructor({id}: {id?: string}) {
    this.id = id;
  }

  public abstract get score(): number;
}
