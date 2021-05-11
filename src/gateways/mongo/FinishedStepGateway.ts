import {Model} from 'mongoose';
import {FinishedStep} from '@/entities';
import {StepRef} from '@/entities/valueObjects';
import {IFinishedStepGateway} from '@/interfaces/gateways';
import {FinishedStepMapper} from '@/mappers';
import {FinishedStepDoc} from './models/types';

export default class FinishedStepGateway implements IFinishedStepGateway {
  FinishedStepModel: Model<FinishedStepDoc, {}, {}>;

  constructor(FinishedStepModel: Model<FinishedStepDoc, {}, {}>) {
    this.FinishedStepModel = FinishedStepModel;
  }

  private docToEntity(entityDoc: FinishedStepDoc) {
    const {
      studentId,
      stepRef: {stepCategory, stepId},
      createdAt
    } = entityDoc;
    return new FinishedStep({
      studentId,
      stepRef: new StepRef(stepId, stepCategory),
      createdAt
    });
  }

  async create(entity: FinishedStep): Promise<FinishedStep> {
    const entityDoc = await this.FinishedStepModel.create(
      FinishedStepMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async get(studentId: string, stepRef: StepRef): Promise<FinishedStep | null> {
    const entityDoc = await this.FinishedStepModel.findOne({
      studentId,
      stepRef
    });
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async getByStudentId(studentId: string): Promise<FinishedStep[]> {
    return (await this.FinishedStepModel.find({studentId})).map(doc =>
      this.docToEntity(doc)
    );
  }

  async update(entity: FinishedStep): Promise<FinishedStep | null> {
    const {studentId, stepRef} = entity;
    const entityDoc = await this.FinishedStepModel.findOneAndUpdate(
      {
        studentId,
        stepRef
      },
      FinishedStepMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<FinishedStep | null> {
    const entityDoc = await this.FinishedStepModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.FinishedStepModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
