import Reading from './Reading';

export default class ReadingForAuthorOrAdmin extends Reading {
  constructor(
    id?: string,
    name?: string,
    public readonly docPath?: string,
    estimatedEffort?: number,
    public readonly modifiedAt?: Date,
    public readonly createdAt?: Date
  ) {
    super(id, name, estimatedEffort);
  }
}
