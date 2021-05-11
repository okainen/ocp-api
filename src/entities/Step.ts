export default abstract class Step {
  public readonly id?: string;
  public readonly name: string;
  public readonly estimatedEffort: number;
  public readonly modifiedAt: Date;
  public readonly createdAt: Date;

  constructor({
    id,
    name,
    estimatedEffort,
    modifiedAt,
    createdAt
  }: {
    id?: string;
    name: string;
    estimatedEffort: number;
    modifiedAt?: Date;
    createdAt?: Date;
  }) {
    this.id = id;
    this.name = name;
    this.estimatedEffort = estimatedEffort;

    const now: Date = new Date();
    this.createdAt = createdAt || now;
    this.modifiedAt = modifiedAt || now;
  }
}
