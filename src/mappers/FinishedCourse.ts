import {FinishedCourse} from '@/entities';

class FinishedCoursePersistenceModel {
  constructor(
    public readonly studentId: string,
    public readonly courseId: string,
    public readonly createdAt: Date
  ) {}
}

export default class FinishedCourseMapper {
  public static toPersistence(course: FinishedCourse) {
    const {studentId, courseId, createdAt} = course;
    return new FinishedCoursePersistenceModel(studentId, courseId, createdAt);
  }
}
