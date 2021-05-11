import {StepCategories} from '@/entities/enums';
import GradedStep from './GradedStep';

export default class FinishedGradedStep extends GradedStep {
  constructor(
    public readonly score?: number,
    public readonly createdAt?: Date,
    stepCategory?: StepCategories,
    stepId?: string,
    availableScore?: number
  ) {
    super(stepCategory, stepId, availableScore);
  }
}
