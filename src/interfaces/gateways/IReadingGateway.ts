import {Reading} from '@/entities';

export default interface IReadingGateway {
  create: (reading: Reading) => Promise<Reading>;
  get: (id: string) => Promise<Reading | null>;
  update: (reading: Reading) => Promise<Reading | null>;
  delete: (id: string) => Promise<Reading | null>;
}
