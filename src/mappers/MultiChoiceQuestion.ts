import {MultiChoiceQuestion} from '@/entities';
import {QuestionOption} from '@/entities/valueObjects';
import {
  QuestionOptionPersistenceModel,
  QuestionPersistenceModel
} from './common';

class MultiChoiceQuestionPersistenceModel extends QuestionPersistenceModel {
  public readonly options: QuestionOptionPersistenceModel[];
  public readonly correctOption: string[];

  constructor(
    description: string,
    options: Set<QuestionOption>,
    correctOption: Set<string>,
    availableScore: number
  ) {
    super(description, availableScore);
    this.options = [...options].map(
      ({id, description}) => new QuestionOptionPersistenceModel(id, description)
    );
    this.correctOption = [...correctOption];
  }
}

export default class MultiChoiceQuestionMapper {
  public static toPersistence(question: MultiChoiceQuestion) {
    const {description, options, correctOption, availableScore} = question;
    return new MultiChoiceQuestionPersistenceModel(
      description,
      options,
      correctOption,
      availableScore
    );
  }
}
