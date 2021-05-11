export default class Enrollment {
  public readonly id?: string;
  public readonly studentId: string;
  public readonly courseId: string;
  public readonly createdAt: Date;

  constructor({
    id,
    studentId,
    courseId,
    createdAt
  }: {
    id?: string;
    studentId: string;
    courseId: string;
    createdAt?: Date;
  }) {
    this.id = id;
    this.studentId = studentId;
    this.courseId = courseId;
    this.createdAt = createdAt || new Date();
  }
}
