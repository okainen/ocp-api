import {MultiChoiceQuestionResponse} from '@/entities';
import {QuestionResponsePersistenceModel} from './common';

class MultiChoiceQuestionResponsePersistenceModel extends QuestionResponsePersistenceModel {
  public readonly choice: string[];
  constructor(questionId: string, choice: Set<string>) {
    super(questionId);
    this.choice = [...choice];
  }
}

export default class MultiChoiceQuestionResponseMapper {
  public static toPersistence(questionResponse: MultiChoiceQuestionResponse) {
    const {question, choice} = questionResponse;
    return new MultiChoiceQuestionResponsePersistenceModel(
      question.id!,
      choice
    );
  }
}
