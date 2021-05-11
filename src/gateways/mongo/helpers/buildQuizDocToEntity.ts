import {Quiz} from '@/entities';
import {QuizDoc} from '../models/types';
import {populateQuestions} from './interfaces';

export default (populateQuestions: populateQuestions) =>
  async (entityDoc: QuizDoc) => {
    const {_id: id, name, estimatedEffort, modifiedAt, createdAt} = entityDoc;
    const questions = await populateQuestions(entityDoc.questions);

    return new Quiz({
      id,
      name,
      estimatedEffort,
      questions,
      modifiedAt,
      createdAt
    });
  };
