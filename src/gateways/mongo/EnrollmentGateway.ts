import {Model} from 'mongoose';
import {Enrollment} from '@/entities';
import {IEnrollmentGateway} from '@/interfaces/gateways';
import {EnrollmentMapper} from '@/mappers';
import {EnrollmentDoc} from './models/types';

export default class EnrollmentGateway implements IEnrollmentGateway {
  EnrollmentModel: Model<EnrollmentDoc, {}, {}>;

  constructor(EnrollmentModel: Model<EnrollmentDoc, {}, {}>) {
    this.EnrollmentModel = EnrollmentModel;
  }

  private docToEntity(entityDoc: EnrollmentDoc) {
    const {_id: id, studentId, courseId, createdAt} = entityDoc;
    return new Enrollment({id, studentId, courseId, createdAt});
  }

  async get(courseId: string, studentId: string): Promise<Enrollment | null> {
    const entityDoc = await this.EnrollmentModel.findOne({courseId, studentId});
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async getCount(filterParams: {
    courseId?: string;
    studentId?: string;
  }): Promise<number> {
    return this.EnrollmentModel.countDocuments(filterParams);
  }

  async getByStudentId(
    studentId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Enrollment[]> {
    const count = await this.getCount({studentId});
    const skip = (page - 1) * pageSize;
    const limit = Math.min(count - skip, pageSize);

    const entityDocs = await this.EnrollmentModel.find({studentId}, null, {
      sort: '-createdAt',
      skip,
      limit
    });
    return entityDocs.map(doc => this.docToEntity(doc));
  }

  async create(entity: Enrollment): Promise<Enrollment> {
    const entityDoc = await this.EnrollmentModel.create(
      EnrollmentMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<Enrollment | null> {
    const entityDoc = await this.EnrollmentModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.EnrollmentModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
