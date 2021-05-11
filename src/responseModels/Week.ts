import {StepRef} from '@/entities/valueObjects';

export default class Week {
  constructor(
    public readonly id?: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly steps?: StepRef[],
    public readonly modifiedAt?: Date,
    public readonly createdAt?: Date
  ) {}
}
