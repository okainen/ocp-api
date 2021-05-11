import {QUESTION_UNKNOWN_CAT_FOUND} from '@/constants/errors';
import {
  MultiChoiceQuestion,
  Question,
  Quiz,
  SingleChoiceQuestion
} from '@/entities';
import {QuestionCategories} from '@/entities/enums';
import {DataIntegrityError} from '@/errors';
import {QuestionRefPersistenceModel, StepPersistenceModel} from './common';

class QuizPersistenceModel extends StepPersistenceModel {
  public readonly questions: QuestionRefPersistenceModel[];

  constructor(
    name: string,
    questions: Question[],
    estimatedEffort: number,
    modifiedAt: Date,
    createdAt: Date
  ) {
    super(name, estimatedEffort, modifiedAt, createdAt);
    this.questions = questions.map(question => {
      switch (question.constructor) {
        case SingleChoiceQuestion: {
          return {
            questionId: question.id!,
            questionCategory: QuestionCategories.SINGLE_CHOICE
          };
        }
        case MultiChoiceQuestion: {
          return {
            questionId: question.id!,
            questionCategory: QuestionCategories.MULTI_CHOICE
          };
        }
        default: {
          throw new DataIntegrityError(QUESTION_UNKNOWN_CAT_FOUND);
        }
      }
    });
  }
}

export default class QuizMapper {
  public static toPersistence(quiz: Quiz) {
    const {name, questions, estimatedEffort, modifiedAt, createdAt} = quiz;
    return new QuizPersistenceModel(
      name,
      questions,
      estimatedEffort,
      modifiedAt,
      createdAt
    );
  }
}
