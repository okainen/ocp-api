import Course from './Course';

export default class CourseForNonStudent extends Course {
  constructor(
    id?: string,
    public readonly authorid?: string,
    name?: string,
    description?: string,
    weekIds?: string[],
    categoryIds?: string[]
  ) {
    super(id, name, description, weekIds, categoryIds);
  }
}
