import {StepRef, Timespan} from './valueObjects';

export default class ScheduledEvent {
  public readonly id?: string;
  public readonly studentId: string;
  public readonly stepRef: StepRef;
  public readonly timespan: Timespan;

  constructor({
    id,
    studentId,
    stepRef,
    timespan
  }: {
    id?: string;
    studentId: string;
    stepRef: StepRef;
    timespan: Timespan;
  }) {
    this.id = id;
    this.studentId = studentId;
    this.stepRef = stepRef;
    this.timespan = timespan;
  }

  update({
    stepRef,
    timespan
  }: {
    stepRef?: StepRef;
    timespan?: Timespan;
  }): ScheduledEvent {
    return new ScheduledEvent({
      id: this.id,
      studentId: this.studentId,
      stepRef: stepRef || this.stepRef,
      timespan: timespan || this.timespan
    });
  }
}
