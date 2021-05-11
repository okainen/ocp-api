import {SingleChoiceQuestionResponse} from '@/entities';
import {QuestionResponsePersistenceModel} from './common';

class SingleChoiceQuestionResponsePersistenceModel extends QuestionResponsePersistenceModel {
  constructor(questionId: string, public readonly choice: string) {
    super(questionId);
  }
}

export default class SingleChoiceQuestionResponseMapper {
  public static toPersistence(questionResponse: SingleChoiceQuestionResponse) {
    const {question, choice} = questionResponse;
    return new SingleChoiceQuestionResponsePersistenceModel(
      question.id!,
      choice
    );
  }
}
