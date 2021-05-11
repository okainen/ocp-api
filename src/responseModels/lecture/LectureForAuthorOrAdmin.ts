import Lecture from './Lecture';

export default class LectureForAuthorOrAdmin extends Lecture {
  constructor(
    id?: string,
    name?: string,
    public readonly videoPath?: string,
    estimatedEffort?: number,
    public readonly modifiedAt?: Date,
    public readonly createdAt?: Date
  ) {
    super(id, name, estimatedEffort);
  }
}
