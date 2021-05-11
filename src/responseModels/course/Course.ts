export default abstract class Course {
  constructor(
    public readonly id?: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly weekIds?: string[],
    public readonly categoryIds?: string[]
  ) {}
}
