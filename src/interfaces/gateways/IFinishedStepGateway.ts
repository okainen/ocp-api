import {FinishedStep} from '@/entities';
import {StepRef} from '@/entities/valueObjects';

export default interface IFinishedStepGateway {
  create: (finishedStep: FinishedStep) => Promise<FinishedStep>;
  get: (studentId: string, stepRef: StepRef) => Promise<FinishedStep | null>;
  getByStudentId: (studentId: string) => Promise<FinishedStep[]>;
  delete: (
    studentId: string,
    stepRef: StepRef
  ) => Promise<FinishedStep | null>;
}
