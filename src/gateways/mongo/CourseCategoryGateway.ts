import {Model} from 'mongoose';
import {CourseCategory} from '@/entities';
import {ICourseCategoryGateway} from '@/interfaces/gateways';
import {CourseCategoryDoc} from './models/types';
import {CourseCategoryMapper} from '@/mappers';

export default class CourseCategoryGateway implements ICourseCategoryGateway {
  private CourseCategoryModel: Model<CourseCategoryDoc, {}, {}>;

  constructor(CourseCategoryModel: Model<CourseCategoryDoc, {}, {}>) {
    this.CourseCategoryModel = CourseCategoryModel;
  }

  private docToEntity(entityDoc: CourseCategoryDoc) {
    const {_id: id, name, createdAt} = entityDoc;
    return new CourseCategory({id, name, createdAt});
  }

  async create(entity: CourseCategory): Promise<CourseCategory> {
    const entityDoc = await this.CourseCategoryModel.create(
      CourseCategoryMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async get(id: string): Promise<CourseCategory | null> {
    const entityDoc = await this.CourseCategoryModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async update(entity: CourseCategory): Promise<CourseCategory | null> {
    const entityDoc = await this.CourseCategoryModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      CourseCategoryMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<CourseCategory | null> {
    const entityDoc = await this.CourseCategoryModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.CourseCategoryModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
