export default class FinishedCourse {
  public readonly studentId: string;
  public readonly courseId: string;
  public readonly score: number;
  public readonly createdAt: Date;
  constructor({
    studentId,
    courseId,
    score,
    createdAt
  }: {
    studentId: string;
    courseId: string;
    score: number;
    createdAt?: Date;
  }) {
    this.studentId = studentId;
    this.courseId = courseId;
    this.score = score;
    this.createdAt = createdAt || new Date();
  }
}
