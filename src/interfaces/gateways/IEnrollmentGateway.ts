import {Enrollment} from '@/entities';

export default interface IEnrollmentGateway {
  create: (enrollment: Enrollment) => Promise<Enrollment>;
  get: (courseId: string, studentId: string) => Promise<Enrollment | null>;
  getCount: (filterParams: {
    courseId?: string;
    studentId?: string;
  }) => Promise<number>;
  getByStudentId: (
    studentId: string,
    page?: number,
    pageSize?: number
  ) => Promise<Enrollment[]>;
  delete: (courseId: string, studentId: string) => Promise<Enrollment | null>;
}
