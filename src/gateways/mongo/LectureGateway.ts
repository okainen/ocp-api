import {Model} from 'mongoose';
import {Lecture} from '@/entities';
import {ILectureGateway} from '@/interfaces/gateways';
import {LectureMapper} from '@/mappers';
import {LectureDoc} from './models/types';

export default class LectureGateway implements ILectureGateway {
  LectureModel: Model<LectureDoc, {}, {}>;

  constructor(LectureModel: Model<LectureDoc, {}, {}>) {
    this.LectureModel = LectureModel;
  }

  private docToEntity(entityDoc: LectureDoc) {
    const {
      _id: id,
      name,
      estimatedEffort,
      videoPath,
      modifiedAt,
      createdAt
    } = entityDoc;
    return new Lecture({
      id,
      name,
      estimatedEffort,
      videoPath,
      modifiedAt,
      createdAt
    });
  }

  async get(id: string): Promise<Lecture | null> {
    const entityDoc = await this.LectureModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async create(entity: Lecture): Promise<Lecture> {
    const entityDoc = await this.LectureModel.create(
      LectureMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async update(entity: Lecture): Promise<Lecture | null> {
    const entityDoc = await this.LectureModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      LectureMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<Lecture | null> {
    const entityDoc = await this.LectureModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.LectureModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
