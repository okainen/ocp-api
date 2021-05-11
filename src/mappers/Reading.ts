import {Reading} from '@/entities';
import {StepPersistenceModel} from './common';

class ReadingPersistenceModel extends StepPersistenceModel {
  public readonly docPath: string | undefined;

  constructor(
    name: string,
    docPath: string | null,
    estimatedEffort: number,
    modifiedAt: Date,
    createdAt: Date
  ) {
    super(name, estimatedEffort, modifiedAt, createdAt);
    this.docPath = docPath || undefined;
  }
}

export default class ReadingMapper {
  public static toPersistence(lecture: Reading) {
    const {name, docPath, estimatedEffort, modifiedAt, createdAt} = lecture;
    return new ReadingPersistenceModel(
      name,
      docPath,
      estimatedEffort,
      modifiedAt,
      createdAt
    );
  }
}
