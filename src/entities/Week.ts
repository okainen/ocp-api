import {StepRef} from './valueObjects';

export default class Week {
  public readonly id?: string;
  public readonly name: string;
  public readonly description: string;
  public readonly steps: StepRef[];
  public readonly modifiedAt: Date;
  public readonly createdAt: Date;

  constructor({
    id,
    name,
    description,
    steps,
    modifiedAt,
    createdAt
  }: {
    id?: string;
    name: string;
    description: string;
    steps?: StepRef[];
    modifiedAt?: Date;
    createdAt?: Date;
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.steps = steps || [];

    const now: Date = new Date();
    this.createdAt = createdAt || now;
    this.modifiedAt = modifiedAt || now;
  }

  update({
    name,
    description,
    steps
  }: {
    name?: string;
    description?: string;
    steps?: StepRef[];
  }): Week {
    return new Week({
      id: this.id,
      name: name || this.name,
      description: description || this.description,
      steps: steps || this.steps,
      createdAt: this.createdAt
    });
  }
}
