import {Model} from 'mongoose';
import {SingleChoiceQuestion} from '@/entities';
import {IQuestionGateway} from '@/interfaces/gateways';
import {SingleChoiceQuestionMapper} from '@/mappers';
import {SingleChoiceQuestionDoc} from './models/types';
import {QuestionOption} from '@/entities/valueObjects';

export default class SingleChoiceQuestionGateway
  implements IQuestionGateway<SingleChoiceQuestion>
{
  SingleChoiceQuestionModel: Model<SingleChoiceQuestionDoc, {}, {}>;

  constructor(
    SingleChoiceQuestionModel: Model<SingleChoiceQuestionDoc, {}, {}>
  ) {
    this.SingleChoiceQuestionModel = SingleChoiceQuestionModel;
  }

  private docToEntity(entityDoc: SingleChoiceQuestionDoc) {
    const {
      _id: id,
      description,
      options,
      correctOption,
      availableScore
    } = entityDoc;
    return new SingleChoiceQuestion({
      id,
      description,
      options: options.map(
        ({id, description}) => new QuestionOption(id, description)
      ),
      correctOption,
      availableScore
    });
  }

  async get(id: string): Promise<SingleChoiceQuestion | null> {
    const entityDoc = await this.SingleChoiceQuestionModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async create(entity: SingleChoiceQuestion): Promise<SingleChoiceQuestion> {
    const entityDoc = (await this.SingleChoiceQuestionModel.create(
      SingleChoiceQuestionMapper.toPersistence(entity)
    )) as SingleChoiceQuestionDoc;

    return this.docToEntity(entityDoc);
  }

  async update(
    entity: SingleChoiceQuestion
  ): Promise<SingleChoiceQuestion | null> {
    const entityDoc = await this.SingleChoiceQuestionModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      SingleChoiceQuestionMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<SingleChoiceQuestion | null> {
    const entityDoc = await this.SingleChoiceQuestionModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.SingleChoiceQuestionModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
