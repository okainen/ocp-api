import {QuestionCategories, StepCategories} from '@/entities/enums';

export class StepRefPersistenceModel {
  constructor(
    public readonly stepId: string,
    public readonly stepCategory: StepCategories
  ) {}
}

export abstract class StepPersistenceModel {
  constructor(
    public readonly name: string,
    public readonly estimatedEffort: number,
    public readonly modifiedAt: Date,
    public readonly createdAt: Date
  ) {}
}

export abstract class QuestionPersistenceModel {
  constructor(
    public readonly description: string,
    public readonly availableScore: number
  ) {}
}

export class QuestionOptionPersistenceModel {
  constructor(
    public readonly id: string,
    public readonly description: string
  ) {}
}

export class QuestionRefPersistenceModel {
  constructor(
    public readonly questionId: string,
    public readonly questionCategory: QuestionCategories
  ) {}
}

export abstract class QuestionResponsePersistenceModel {
  constructor(public readonly questionId: string) {}
}

export class QuestionResponseRefPersistenceModel {
  constructor(
    public readonly questionResponseId: string,
    public readonly questionCategory: QuestionCategories
  ) {}
}

export class TimespanPersistenceModel {
  constructor(public readonly beginning: Date, public readonly end: Date) {}
}
