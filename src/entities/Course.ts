export default class Course {
  public readonly id?: string;
  public readonly authorId: string;
  public readonly name: string;
  public readonly description: string;
  public readonly weekIds: string[];
  public readonly categoryIds: string[];
  public readonly imgPath: string | null;
  public readonly isPublished: boolean;
  public readonly modifiedAt: Date;
  public readonly createdAt: Date;

  constructor({
    id,
    authorId,
    name,
    description,
    weekIds,
    categoryIds,
    imgPath,
    isPublished,
    modifiedAt,
    createdAt
  }: {
    id?: string;
    authorId: string;
    name: string;
    description: string;
    weekIds?: string[];
    categoryIds?: string[];
    imgPath?: string | null;
    isPublished?: boolean;
    modifiedAt?: Date;
    createdAt?: Date;
  }) {
    this.id = id;
    this.authorId = String(authorId);
    this.name = name;
    this.description = description;
    this.weekIds = weekIds || [];
    this.categoryIds = categoryIds || [];
    this.imgPath = imgPath !== undefined ? imgPath : null;
    this.isPublished = isPublished || false;

    const now: Date = new Date();
    this.createdAt = createdAt || now;
    this.modifiedAt = modifiedAt || now;
  }

  update({
    name,
    description,
    weekIds,
    categoryIds,
    imgPath,
    isPublished
  }: {
    name?: string;
    description?: string;
    weekIds?: string[];
    categoryIds?: string[];
    imgPath?: string;
    isPublished?: boolean;
  }): Course {
    return new Course({
      id: this.id,
      authorId: this.authorId,
      name: name || this.name,
      description: description || this.description,
      weekIds: weekIds || this.weekIds,
      categoryIds: categoryIds || this.categoryIds,
      imgPath,
      isPublished: isPublished !== undefined ? isPublished : this.isPublished,
      createdAt: this.createdAt
    });
  }
}
