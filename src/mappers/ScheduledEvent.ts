import {ScheduledEvent} from '@/entities';
import {StepRef, Timespan} from '@/entities/valueObjects';
import {StepRefPersistenceModel, TimespanPersistenceModel} from './common';

class ScheduledEventPersistenceModel {
  public readonly stepRef: StepRefPersistenceModel;
  public readonly timespan: TimespanPersistenceModel;

  constructor(
    public readonly studentId: string,
    {stepCategory, stepId}: StepRef,
    {beginning, end}: Timespan
  ) {
    this.stepRef = new StepRefPersistenceModel(stepId, stepCategory);
    this.timespan = new TimespanPersistenceModel(beginning, end);
  }
}

export default class ScheduledEventMapper {
  public static toPersistence(scheduledEvent: ScheduledEvent) {
    const {studentId, stepRef, timespan} = scheduledEvent;
    return new ScheduledEventPersistenceModel(studentId, stepRef, timespan);
  }
}
