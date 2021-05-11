import {StepCategories} from '../enums';

export default class StepRef {
  constructor(
    public readonly stepId: string,
    public readonly stepCategory: StepCategories
  ) {}

  public isEqual(stepRef: StepRef) {
    return (
      this.stepCategory === stepRef.stepCategory &&
      this.stepId === stepRef.stepId
    );
  }
}
