import {Course} from '@/entities';

export default interface ICourseGateway {
  create: (course: Course) => Promise<Course>;
  get: (id: string) => Promise<Course | null>;
  getCount: (filterParams: {
    authorId?: string;
    name?: RegExp;
    isPublished?: boolean;
  }) => Promise<number>;
  getAll: (
    filterParams: {
      authorId?: string;
      name?: RegExp;
      isPublished?: boolean;
    },
    page?: number,
    pageSize?: number
  ) => Promise<Course[]>;
  getByWeekId: (weekId: string) => Promise<Course | null>;
  update: (course: Course) => Promise<Course | null>;
  delete: (id: string) => Promise<Course | null>;
}
