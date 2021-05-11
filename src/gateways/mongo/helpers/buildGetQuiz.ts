import {Model} from 'mongoose';
import {Quiz} from '@/entities';
import {QuizDoc} from '../models/types';
import {quizDocToEntity} from './interfaces';

export default (
    QuizModel: Model<QuizDoc, {}, {}>,
    quizDocToEntity: quizDocToEntity
  ) =>
  async (id: string): Promise<Quiz | null> => {
    const quizDoc = await QuizModel.findById(id);
    if (!quizDoc) {
      return null;
    }

    return await quizDocToEntity(quizDoc);
  };
