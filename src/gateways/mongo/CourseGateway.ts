import {Model} from 'mongoose';
import {Course} from '@/entities';
import {ICourseGateway} from '@/interfaces/gateways';
import {CourseMapper} from '@/mappers';
import {CourseDoc} from './models/types';

export default class CourseGateway implements ICourseGateway {
  CourseModel: Model<CourseDoc, {}, {}>;

  constructor(CourseModel: Model<CourseDoc, {}, {}>) {
    this.CourseModel = CourseModel;
  }

  private docToEntity(entityDoc: CourseDoc) {
    const {
      _id: id,
      authorId,
      name,
      description,
      weekIds,
      categoryIds,
      imgPath,
      isPublished,
      modifiedAt,
      createdAt
    } = entityDoc;
    return new Course({
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
    });
  }

  async get(id: string): Promise<Course | null> {
    const entityDoc = await this.CourseModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async getCount(filterParams: {
    authorId?: string;
    name?: RegExp;
    isPublished?: boolean;
  }): Promise<number> {
    return this.CourseModel.countDocuments(filterParams);
  }

  async getAll(
    filterParams: {
      authorId?: string;
      name?: RegExp;
      isPublished?: boolean;
    },
    page: number = 1,
    pageSize: number = 10
  ): Promise<Course[]> {
    const count = await this.getCount(filterParams);
    const skip = (page - 1) * pageSize;
    const limit = Math.min(count - skip, pageSize);

    const entityDocs = await this.CourseModel.find(filterParams, null, {
      sort: '-createdAt',
      skip,
      limit
    });

    return entityDocs.map(doc => this.docToEntity(doc));
  }

  async getByWeekId(weekId: string): Promise<Course | null> {
    const entityDoc = await this.CourseModel.findOne({
      weekIds: {$elemMatch: {$eq: weekId}}
    });
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async create(entity: Course): Promise<Course> {
    const entityDoc = await this.CourseModel.create(
      CourseMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async update(entity: Course): Promise<Course | null> {
    const entityDoc = await this.CourseModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      CourseMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<Course | null> {
    const entityDoc = await this.CourseModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.CourseModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
