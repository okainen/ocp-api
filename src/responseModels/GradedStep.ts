import {StepCategories} from '@/entities/enums';

export default class GradedStep {
  constructor(
    public readonly stepCategory?: StepCategories,
    public readonly stepid?: string,
    public readonly availableScore?: number
  ) {}
}
