import Course from './Course';

export default class CourseForStudent extends Course {
  constructor(
    id?: string,
    public readonly authorid?: string,
    name?: string,
    description?: string,
    weekIds?: string[],
    categoryIds?: string[],
    public readonly isEnrolledIn?: boolean
  ) {
    super(id, name, description, weekIds, categoryIds);
  }
}
