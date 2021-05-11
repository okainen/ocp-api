import {StepRef, Timespan} from '@/entities/valueObjects';

export default class ScheduledEvent {
  constructor(
    public readonly id?: string,
    public readonly stepRef?: StepRef,
    public readonly timespan?: Timespan
  ) {}
}
