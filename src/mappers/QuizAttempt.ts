import {QUESTION_RESPONSE_UNKNOWN_CAT_FOUND} from '@/constants/errors';
import {
  MultiChoiceQuestionResponse,
  QuestionResponse,
  Quiz,
  QuizAttempt,
  SingleChoiceQuestionResponse
} from '@/entities';
import {QuestionCategories} from '@/entities/enums';
import {DataIntegrityError} from '@/errors';
import {QuestionResponseRefPersistenceModel} from './common';

class QuizAttemptPersistenceModel {
  public readonly quizId: string;
  public readonly response: (QuestionResponseRefPersistenceModel | null)[];

  constructor(
    quiz: Quiz,
    public readonly studentId: string,
    response: (QuestionResponse | null)[],
    public readonly modifiedAt: Date,
    public readonly createdAt: Date
  ) {
    this.quizId = quiz.id!;
    this.response = response.map(questionResponse => {
      if (!questionResponse) {
        return null;
      }
      switch (questionResponse.constructor) {
        case SingleChoiceQuestionResponse: {
          return {
            questionResponseId: questionResponse.id!,
            questionCategory: QuestionCategories.SINGLE_CHOICE
          };
        }
        case MultiChoiceQuestionResponse: {
          return {
            questionResponseId: questionResponse.id!,
            questionCategory: QuestionCategories.MULTI_CHOICE
          };
        }
        default: {
          throw new DataIntegrityError(QUESTION_RESPONSE_UNKNOWN_CAT_FOUND);
        }
      }
    });
  }
}

export default class QuizAttemptMapper {
  public static toPersistence(quizAttempt: QuizAttempt) {
    const {quiz, studentId, response, modifiedAt, createdAt} = quizAttempt;
    return new QuizAttemptPersistenceModel(
      quiz,
      studentId,
      response,
      modifiedAt,
      createdAt
    );
  }
}
