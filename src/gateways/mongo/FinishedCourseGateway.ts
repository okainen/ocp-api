import {Model} from 'mongoose';
import {FinishedCourse} from '@/entities';
import {IFinishedCourseGateway} from '@/interfaces/gateways';
import {FinishedCourseDoc} from './models/types';
import {FinishedCourseMapper} from '@/mappers';

export default class FinishedCourseGateway implements IFinishedCourseGateway {
  private FinishedCourseModel: Model<FinishedCourseDoc, {}, {}>;

  constructor(FinishedCourseModel: Model<FinishedCourseDoc, {}, {}>) {
    this.FinishedCourseModel = FinishedCourseModel;
  }

  private docToEntity(entityDoc: FinishedCourseDoc) {
    const {studentId, courseId, score, createdAt} = entityDoc;
    return new FinishedCourse({studentId, courseId, score, createdAt});
  }

  async get(
    studentId: string,
    courseId: string
  ): Promise<FinishedCourse | null> {
    const entityDoc = await this.FinishedCourseModel.findOne({
      studentId,
      courseId
    });
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async create(entity: FinishedCourse): Promise<FinishedCourse> {
    const entityDoc = await this.FinishedCourseModel.create(
      FinishedCourseMapper.toPersistence(entity)
    );
    
    return this.docToEntity(entityDoc);
  }

  async delete(
    studentId: string,
    courseId: string
  ): Promise<FinishedCourse | null> {
    const entityDoc = await this.FinishedCourseModel.findOne({
      studentId,
      courseId
    });
    if (!entityDoc) {
      return null;
    }

    await this.FinishedCourseModel.deleteOne({studentId, courseId});

    return this.docToEntity(entityDoc);
  }
}
