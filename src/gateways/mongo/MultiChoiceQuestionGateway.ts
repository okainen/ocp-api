import {Model} from 'mongoose';
import {MultiChoiceQuestion} from '@/entities';
import {IQuestionGateway} from '@/interfaces/gateways';
import {MultiChoiceQuestionMapper} from '@/mappers';
import {MultiChoiceQuestionDoc} from './models/types';
import {QuestionOption} from '@/entities/valueObjects';

export default class MultiChoiceQuestionGateway
  implements IQuestionGateway<MultiChoiceQuestion>
{
  MultiChoiceQuestionModel: Model<MultiChoiceQuestionDoc, {}, {}>;

  constructor(MultiChoiceQuestionModel: Model<MultiChoiceQuestionDoc, {}, {}>) {
    this.MultiChoiceQuestionModel = MultiChoiceQuestionModel;
  }

  private docToEntity(entityDoc: MultiChoiceQuestionDoc) {
    const {
      _id: id,
      description,
      options,
      correctOption,
      availableScore
    } = entityDoc;
    return new MultiChoiceQuestion({
      id,
      description,
      options: options.map(
        ({id, description}) => new QuestionOption(id, description)
      ),
      correctOption,
      availableScore
    });
  }

  async get(id: string): Promise<MultiChoiceQuestion | null> {
    const entityDoc = await this.MultiChoiceQuestionModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async create(entity: MultiChoiceQuestion): Promise<MultiChoiceQuestion> {
    const entityDoc = await this.MultiChoiceQuestionModel.create(
      MultiChoiceQuestionMapper.toPersistence(entity)
    );

    return this.docToEntity(entityDoc);
  }

  async update(
    entity: MultiChoiceQuestion
  ): Promise<MultiChoiceQuestion | null> {
    const entityDoc = await this.MultiChoiceQuestionModel.findOneAndUpdate(
      {
        _id: entity.id
      },
      MultiChoiceQuestionMapper.toPersistence(entity),
      {new: true}
    );
    if (!entityDoc) {
      return null;
    }

    return this.docToEntity(entityDoc);
  }

  async delete(id: string): Promise<MultiChoiceQuestion | null> {
    const entityDoc = await this.MultiChoiceQuestionModel.findById(id);
    if (!entityDoc) {
      return null;
    }

    await this.MultiChoiceQuestionModel.deleteOne({_id: id});

    return this.docToEntity(entityDoc);
  }
}
