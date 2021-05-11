export default class CourseCategory {
  constructor(
    public readonly id?: string,
    public readonly name?: string,
    public readonly modifiedAt?: Date,
    public readonly createdAt?: Date
  ) {}
}
