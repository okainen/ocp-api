import Lecture from './Lecture';

export default class LectureForStudent extends Lecture {
  constructor(
    id?: string,
    name?: string,
    public readonly videoPath?: string,
    estimatedEffort?: number,
    public readonly finishedAt?: Date,
  ) {
    super(id, name, estimatedEffort);
  }
}
