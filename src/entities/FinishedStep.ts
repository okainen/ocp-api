import {StepRef} from './valueObjects';

export default class FinishedStep {
  public readonly studentId: string;
  public readonly stepRef: StepRef;
  public readonly createdAt: Date;

  constructor({
    studentId,
    stepRef,
    createdAt
  }: {
    studentId: string;
    stepRef: StepRef;
    createdAt?: Date;
  }) {
    this.studentId = studentId;
    this.stepRef = stepRef;
    this.createdAt = createdAt || new Date();
  }
}
