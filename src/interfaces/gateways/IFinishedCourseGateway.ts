import {FinishedCourse} from '@/entities';

export default interface IFinishedCourseGateway {
  create: (entity: FinishedCourse) => Promise<FinishedCourse>;
  get: (studentId: string, courseId: string) => Promise<FinishedCourse | null>;
  delete: (
    studentId: string,
    courseId: string
  ) => Promise<FinishedCourse | null>;
}
