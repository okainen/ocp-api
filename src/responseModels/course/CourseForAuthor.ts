import Course from './Course';

export default class CourseForAuthor extends Course {
  constructor(
    id?: string,
    name?: string,
    description?: string,
    weekIds?: string[],
    categoryIds?: string[],
    public readonly isPublished?: boolean,
    public readonly modifiedAt?: Date,
    public readonly createdAt?: Date
  ) {
    super(id, name, description, weekIds, categoryIds);
  }
}
