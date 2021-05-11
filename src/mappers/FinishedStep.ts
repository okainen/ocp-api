import {FinishedStep} from '@/entities';
import {StepRef} from '@/entities/valueObjects';
import {StepRefPersistenceModel} from './common';

class FinishedStepPersistenceModel {
  public readonly stepRef: StepRefPersistenceModel;
  constructor(
    public readonly studentId: string,
    {stepId, stepCategory}: StepRef,
    public readonly createdAt: Date
  ) {
    this.stepRef = new StepRefPersistenceModel(stepId, stepCategory);
  }
}

export default class FinishedStepMapper {
  public static toPersistence(finishedStep: FinishedStep) {
    const {studentId, stepRef, createdAt} = finishedStep;
    return new FinishedStepPersistenceModel(studentId, stepRef, createdAt);
  }
}
