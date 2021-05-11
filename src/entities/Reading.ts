import {Step} from '.';

export default class Reading extends Step {
  public readonly docPath: string | null = null; // path of doc file relative to root

  constructor({
    id,
    name,
    estimatedEffort,
    docPath,
    modifiedAt,
    createdAt
  }: {
    id?: string;
    name: string;
    estimatedEffort: number;
    docPath?: string | null;
    modifiedAt?: Date;
    createdAt?: Date;
  }) {
    super({id, name, estimatedEffort, modifiedAt, createdAt});
    this.docPath = docPath !== undefined ? docPath : null;
  }

  update({
    name,
    estimatedEffort,
    docPath
  }: {
    name?: string;
    estimatedEffort?: number;
    docPath?: string | null;
  }): Reading {
    return new Reading({
      id: this.id,
      name: name || this.name,
      estimatedEffort: estimatedEffort || this.estimatedEffort,
      docPath,
      createdAt: this.createdAt
    });
  }
}
