import {SingleChoiceQuestion} from '@/entities';
import {QuestionOption} from '@/entities/valueObjects';
import {
  QuestionOptionPersistenceModel,
  QuestionPersistenceModel
} from './common';

class SingleChoiceQuestionPersistenceModel extends QuestionPersistenceModel {
  public readonly options: QuestionOptionPersistenceModel[];

  constructor(
    description: string,
    options: Set<QuestionOption>,
    public readonly correctOption: string,
    availableScore: number
  ) {
    super(description, availableScore);
    this.options = [...options].map(
      ({id, description}) => new QuestionOptionPersistenceModel(id, description)
    );
  }
}

export default class SingleChoiceQuestionMapper {
  public static toPersistence(question: SingleChoiceQuestion) {
    const {description, options, correctOption, availableScore} = question;
    return new SingleChoiceQuestionPersistenceModel(
      description,
      options,
      correctOption,
      availableScore
    );
  }
}
