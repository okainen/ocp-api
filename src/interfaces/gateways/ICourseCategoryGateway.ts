import {CourseCategory} from '@/entities';

export default interface ICourseCategoryGateway {
  create: (category: CourseCategory) => Promise<CourseCategory>;
  get: (id: string) => Promise<CourseCategory | null>;
  update: (category: CourseCategory) => Promise<CourseCategory | null>;
  delete: (id: string) => Promise<CourseCategory | null>;
}
