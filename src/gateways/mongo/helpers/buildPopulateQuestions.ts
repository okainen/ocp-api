import {
  MULTI_CHOICE_QUESTION_NOT_FOUND,
  QUESTION_UNKNOWN_CAT_FOUND,
  SINGLE_CHOICE_QUESTION_NOT_FOUND
} from '@/constants/errors';
import {QuestionCategories} from '@/entities/enums';
import {DataIntegrityError} from '@/errors';
import {Model} from 'mongoose';
import {
  MultiChoiceQuestionDoc,
  QuestionRefDoc,
  SingleChoiceQuestionDoc
} from '../models/types';
import {
  singleChoiceQuestionDocToEntity,
  multiChoiceQuestionDocToEntity
} from './interfaces';

export default (
    SingleChoiceQuestionModel: Model<SingleChoiceQuestionDoc, {}, {}>,
    MultiChoiceQuestionModel: Model<MultiChoiceQuestionDoc, {}, {}>,
    singleChoiceQuestionDocToEntity: singleChoiceQuestionDocToEntity,
    multiChoiceQuestionDocToEntity: multiChoiceQuestionDocToEntity
  ) =>
  async (questionRefs: QuestionRefDoc[]) => {
    return await Promise.all(
      questionRefs.map(
        async ({questionId, questionCategory}: QuestionRefDoc) => {
          switch (questionCategory) {
            case QuestionCategories.SINGLE_CHOICE: {
              const questionDoc = await SingleChoiceQuestionModel.findById(
                questionId
              );
              if (!questionDoc) {
                throw new DataIntegrityError(SINGLE_CHOICE_QUESTION_NOT_FOUND);
              }

              return singleChoiceQuestionDocToEntity(questionDoc);
            }
            case QuestionCategories.MULTI_CHOICE: {
              const questionDoc = await MultiChoiceQuestionModel.findById(
                questionId
              );
              if (!questionDoc) {
                throw new DataIntegrityError(MULTI_CHOICE_QUESTION_NOT_FOUND);
              }

              return multiChoiceQuestionDocToEntity(questionDoc);
            }
            default: {
              throw new DataIntegrityError(QUESTION_UNKNOWN_CAT_FOUND);
            }
          }
        }
      )
    );
  };
