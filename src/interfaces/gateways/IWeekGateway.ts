import {Week} from '@/entities';
import {StepRef} from '@/entities/valueObjects';

export default interface IWeekGateway {
  create: (week: Week) => Promise<Week>;
  get: (id: string) => Promise<Week | null>;
  getByStepRef: (stepRef: StepRef) => Promise<Week | null>;
  update: (week: Week) => Promise<Week | null>;
  delete: (id: string) => Promise<Week | null>;
}
