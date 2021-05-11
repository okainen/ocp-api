import {Enrollment} from '@/entities';

class EnrollmentPersistenceModel {
  constructor(
    public readonly studentId: string,
    public readonly courseId: string,
    public readonly createdAt: Date
  ) {}
}

export default class EnrollmentMapper {
  public static toPersistence(enrollment: Enrollment) {
    const {studentId, courseId, createdAt} = enrollment;
    return new EnrollmentPersistenceModel(studentId, courseId, createdAt);
  }
}
