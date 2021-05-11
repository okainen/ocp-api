import {Model} from 'mongoose';
import {Reading} from '@/entities';
import {IReadingGateway} from '@/interfaces/gateways';
import {ReadingMapper} from '@/mappers';
import {ReadingDoc} from './models/types';

export default class ReadingGateway implements IReadingGateway {
  ReadingModel: Model<ReadingDoc, {}, {}>;

  constructor(ReadingModel: Model<ReadingDoc, {}, {}>) {
    this.ReadingModel = ReadingModel;
  }

  private docToEntity(entityDoc: ReadingDoc) {
    const {
      _id: id,
      name,
      estimatedEffort,
      docPath,
      modifiedAt,
      createdAt
    } = entityDoc;
    return new Reading({
      id,
      name,
      estimatedEffort,
      docPath,
      modifiedAt,
      createdAt
    });
  }

  async get(id: string): Promise<Reading | null> {
    const entityDoc = await this.ReadingModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async create(entity: Reading): Promise<Reading> {
    const entityDoc = await this.ReadingModel.create(
      ReadingMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async update(entity: Reading): Promise<Reading | null> {
    const entityDoc = await this.ReadingModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      ReadingMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<Reading | null> {
    const entityDoc = await this.ReadingModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.ReadingModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
