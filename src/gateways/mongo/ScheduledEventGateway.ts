import {Model} from 'mongoose';
import {ScheduledEvent} from '@/entities';
import {IScheduledEventGateway} from '@/interfaces/gateways';
import {ScheduledEventMapper} from '@/mappers';
import {ScheduledEventDoc} from './models/types';
import {StepRef, Timespan} from '@/entities/valueObjects';

export default class ScheduledEventGateway implements IScheduledEventGateway {
  ScheduledEventModel: Model<ScheduledEventDoc, {}, {}>;

  constructor(ScheduledEventModel: Model<ScheduledEventDoc, {}, {}>) {
    this.ScheduledEventModel = ScheduledEventModel;
  }

  private docToEntity(entityDoc: ScheduledEventDoc) {
    const {
      _id: id,
      studentId,
      stepRef: {stepCategory, stepId},
      timespan: {beginning, end}
    } = entityDoc;
    return new ScheduledEvent({
      id,
      studentId,
      stepRef: new StepRef(stepId, stepCategory),
      timespan: new Timespan(beginning, end)
    });
  }

  async create(entity: ScheduledEvent): Promise<ScheduledEvent> {
    const entityDoc = await this.ScheduledEventModel.create(
      ScheduledEventMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async get(id: string): Promise<ScheduledEvent | null> {
    const entityDoc = await this.ScheduledEventModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async getAllByDay(
    studentId: string,
    date: Date,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ScheduledEvent[]> {
    const count = await this.ScheduledEventModel.countDocuments();
    const skip = (page - 1) * pageSize;
    const limit = Math.min(count - skip, pageSize);

    const dayBeginning = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(24, 0, 0, 0));

    return (
      await this.ScheduledEventModel.find(
        {
          studentId,
          'timespan.beginning': {$gte: dayBeginning, $lte: dayEnd}
        },
        null,
        {
          sort: 'timespan.beginning',
          skip,
          limit
        }
      )
    ).map(doc => this.docToEntity(doc));
  }

  async getAllByWeek(
    studentId: string,
    date: Date,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ScheduledEvent[]> {
    const count = await this.ScheduledEventModel.countDocuments();
    const skip = (page - 1) * pageSize;
    const limit = Math.min(count - skip, pageSize);

    const weekBeginning = new Date(
      new Date(date.setDate(date.getDate() - date.getDay())).setHours(
        0,
        0,
        0,
        0
      )
    );
    const weekEnd = new Date(
      new Date(date.setDate(date.getDate() + 6 - date.getDay())).setHours(
        0,
        0,
        0,
        0
      )
    );

    return (
      await this.ScheduledEventModel.find(
        {
          studentId,
          'timespan.beginning': {$gte: weekBeginning, $lte: weekEnd}
        },
        null,
        {
          sort: 'timespan.beginning',
          skip,
          limit
        }
      )
    ).map(doc => this.docToEntity(doc));
  }

  async getAllByMonth(
    studentId: string,
    date: Date,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ScheduledEvent[]> {
    const count = await this.ScheduledEventModel.countDocuments();
    const skip = (page - 1) * pageSize;
    const limit = Math.min(count - skip, pageSize);

    const monthBeginning = new Date(
      new Date(date.setMonth(date.getMonth(), 1)).setHours(0, 0, 0, 0)
    );
    const monthEnd = new Date(date.setMonth(date.getMonth() + 1, 0)).setHours(
      0,
      0,
      0,
      0
    );

    return (
      await this.ScheduledEventModel.find(
        {
          studentId,
          'timespan.beginning': {$gte: monthBeginning, $lte: monthEnd}
        },
        null,
        {
          sort: 'timespan.beginning',
          skip,
          limit
        }
      )
    ).map(doc => this.docToEntity(doc));
  }

  async update(entity: ScheduledEvent): Promise<ScheduledEvent | null> {
    const entityDoc = await this.ScheduledEventModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      ScheduledEventMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<ScheduledEvent | null> {
    const entityDoc = await this.ScheduledEventModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.ScheduledEventModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
