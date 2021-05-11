import {Week} from '@/entities';
import {StepRef} from '@/entities/valueObjects';
import {StepRefPersistenceModel} from './common';

class WeekPersistenceModel {
  public readonly steps: StepRefPersistenceModel[];

  constructor(
    public readonly name: string,
    public readonly description: string,
    steps: StepRef[],
    public readonly modifiedAt: Date,
    public readonly createdAt: Date
  ) {
    this.steps = steps.map(
      ({stepCategory, stepId}) =>
        new StepRefPersistenceModel(stepId, stepCategory)
    );
  }
}

export default class WeekMapper {
  public static toPersistence(week: Week) {
    const {name, description, steps, modifiedAt, createdAt} = week;
    return new WeekPersistenceModel(
      name,
      description,
      steps,
      modifiedAt,
      createdAt
    );
  }
}
