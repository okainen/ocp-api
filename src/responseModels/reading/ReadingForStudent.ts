import Reading from './Reading';

export default class ReadingForStudent extends Reading {
  constructor(
    id?: string,
    name?: string,
    public readonly docPath?: string,
    estimatedEffort?: number,
    public readonly finishedAt?: Date
  ) {
    super(id, name, estimatedEffort);
  }
}
