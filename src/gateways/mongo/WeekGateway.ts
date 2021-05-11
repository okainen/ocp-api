import {Model} from 'mongoose';
import {Week} from '@/entities';
import {StepRef} from '@/entities/valueObjects';
import {IWeekGateway} from '@/interfaces/gateways';
import {WeekMapper} from '@/mappers';
import {WeekDoc} from './models/types';

export default class WeekGateway implements IWeekGateway {
  private WeekModel: Model<WeekDoc, {}, {}>;

  constructor(WeekModel: Model<WeekDoc, {}, {}>) {
    this.WeekModel = WeekModel;
  }

  private docToEntity(entityDoc: WeekDoc) {
    const {
      _id: id,
      name,
      description,
      steps,
      modifiedAt,
      createdAt
    } = entityDoc;
    return new Week({
      id,
      name,
      description,
      steps: steps.map(
        ({stepId, stepCategory}) => new StepRef(stepId, stepCategory)
      ),
      modifiedAt,
      createdAt
    });
  }

  async get(id: string): Promise<Week | null> {
    const entityDoc = await this.WeekModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async getByStepRef({stepId, stepCategory}: StepRef): Promise<Week | null> {
    const entityDoc = await this.WeekModel.findOne({
      steps: {$elemMatch: {stepId, stepCategory}}
    });
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async create(entity: Week): Promise<Week> {
    const entityDoc = await this.WeekModel.create(
      WeekMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async update(entity: Week): Promise<Week | null> {
    const entityDoc = await this.WeekModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      WeekMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<Week | null> {
    const entityDoc = await this.WeekModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.WeekModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
