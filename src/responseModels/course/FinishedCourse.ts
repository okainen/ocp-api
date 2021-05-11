import CourseForStudent from './CourseForStudent';

export default class FinishedCourse extends CourseForStudent {
  constructor(
    id?: string,
    authorId?: string,
    name?: string,
    description?: string,
    weekIds?: string[],
    categoryIds?: string[],
    isEnrolledIn?: boolean,
    public readonly score?: number,
    public readonly finishedAt?: Date
  ) {
    super(id, authorId, name, description, weekIds, categoryIds, isEnrolledIn);
  }
}
