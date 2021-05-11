export default class CourseCategory {
  public readonly id?: string;
  public readonly name: string;
  public readonly modifiedAt: Date;
  public readonly createdAt: Date;
  constructor({
    id,
    name,
    createdAt
  }: {
    id?: string;
    name: string;
    createdAt?: Date;
  }) {
    this.id = id;
    this.name = name;

    const now = new Date();
    this.modifiedAt = now;
    this.createdAt = createdAt || now;
  }

  update({name}: {name?: string}) {
    return new CourseCategory({
      id: this.id,
      name: name || this.name,
      createdAt: this.createdAt
    });
  }
}
