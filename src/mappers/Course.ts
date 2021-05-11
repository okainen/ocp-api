import {Course} from '@/entities';

class CoursePersistenceModel {
  constructor(
    public readonly authorId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly isPublished: boolean,
    public readonly weekIds: string[],
    public readonly categoryIds: string[],
    public readonly modifiedAt: Date,
    public readonly createdAt: Date
  ) {}
}

export default class CourseMapper {
  public static toPersistence(course: Course) {
    const {
      authorId,
      name,
      description,
      isPublished,
      weekIds,
      categoryIds,
      modifiedAt,
      createdAt
    } = course;
    return new CoursePersistenceModel(
      authorId,
      name,
      description,
      isPublished,
      weekIds,
      categoryIds,
      modifiedAt,
      createdAt
    );
  }
}
