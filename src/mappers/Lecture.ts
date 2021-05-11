import {Lecture} from '@/entities';
import {StepPersistenceModel} from './common';

class LecturePersistenceModel extends StepPersistenceModel {
  public readonly videoPath: string | undefined;

  constructor(
    name: string,
    videoPath: string | null,
    estimatedEffort: number,
    modifiedAt: Date,
    createdAt: Date
  ) {
    super(name, estimatedEffort, modifiedAt, createdAt);
    this.videoPath = videoPath || undefined;
  }
}

export default class LectureMapper {
  public static toPersistence(lecture: Lecture) {
    const {name, videoPath, estimatedEffort, modifiedAt, createdAt} = lecture;
    return new LecturePersistenceModel(
      name,
      videoPath,
      estimatedEffort,
      modifiedAt,
      createdAt
    );
  }
}
