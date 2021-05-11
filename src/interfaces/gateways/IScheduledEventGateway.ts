import {ScheduledEvent} from '@/entities';

export default interface IScheduledEventGateway {
  create: (scheduledEvent: ScheduledEvent) => Promise<ScheduledEvent>;
  get: (id: string) => Promise<ScheduledEvent | null>;
  getAllByDay: (
    studentId: string,
    date: Date,
    page?: number,
    pageSize?: number
  ) => Promise<ScheduledEvent[]>;
  getAllByWeek: (
    studentId: string,
    date: Date,
    page?: number,
    pageSize?: number
  ) => Promise<ScheduledEvent[]>;
  getAllByMonth: (
    studentId: string,
    date: Date,
    page?: number,
    pageSize?: number
  ) => Promise<ScheduledEvent[]>;
  update: (
    scheduledEvent: ScheduledEvent
  ) => Promise<ScheduledEvent | null>;
  delete: (id: string) => Promise<ScheduledEvent | null>;
}
