import {CourseCategory} from '@/entities';

class CourseCategoryPersistenceModel {
  constructor(
    public readonly name: string,
    public readonly modifiedAt: Date,
    public readonly createdAt: Date
  ) {}
}

export default class CourseCategoryMapper {
  public static toPersistence(course: CourseCategory) {
    const {name, modifiedAt, createdAt} = course;
    return new CourseCategoryPersistenceModel(name, modifiedAt, createdAt);
  }
}
