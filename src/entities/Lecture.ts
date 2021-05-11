import {Step} from '.';

export default class Lecture extends Step {
  public readonly videoPath: string | null = null; // path of video file relative to root

  constructor({
    id,
    name,
    estimatedEffort,
    videoPath,
    modifiedAt,
    createdAt
  }: {
    id?: string;
    name: string;
    estimatedEffort: number;
    videoPath?: string | null;
    modifiedAt?: Date;
    createdAt?: Date;
  }) {
    super({id, name, estimatedEffort, modifiedAt, createdAt});
    this.videoPath = videoPath !== undefined ? videoPath : null;
  }

  update({
    name,
    estimatedEffort,
    videoPath
  }: {
    name?: string;
    estimatedEffort?: number;
    videoPath?: string | null;
  }): Lecture {
    return new Lecture({
      id: this.id,
      name: name || this.name,
      estimatedEffort: estimatedEffort || this.estimatedEffort,
      videoPath,
      createdAt: this.createdAt
    });
  }
}
