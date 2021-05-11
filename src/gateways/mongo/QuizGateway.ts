import {Model} from 'mongoose';
import {MultiChoiceQuestion, Quiz, SingleChoiceQuestion} from '@/entities';
import {IQuizGateway} from '@/interfaces/gateways';
import {QuizMapper} from '@/mappers';
import {
  MultiChoiceQuestionDoc,
  QuizDoc,
  SingleChoiceQuestionDoc
} from './models/types';
import {QuestionCategories} from '@/entities/enums';
import {DataIntegrityError} from '@/errors';
import {QUESTION_UNKNOWN_CAT_FOUND, QUIZ_NOT_FOUND} from '@/constants/errors';
import {quizDocToEntity, getQuiz} from './helpers/interfaces';

interface IQuestionRef {
  questionId: string;
  questionCategory: QuestionCategories;
}

export default class QuizGateway implements IQuizGateway {
  constructor(
    private QuizModel: Model<QuizDoc, {}, {}>,
    private SingleChoiceQuestionModel: Model<SingleChoiceQuestionDoc, {}, {}>,
    private MultiChoiceQuestionModel: Model<MultiChoiceQuestionDoc, {}, {}>,
    private quizDocToEntity: quizDocToEntity,
    private getQuiz: getQuiz
  ) {}

  async get(id: string): Promise<Quiz | null> {
    return this.getQuiz(id);
  }

  async getByQuestionRef(questionRef: IQuestionRef): Promise<Quiz | null> {
    const quizDoc = await this.QuizModel.findOne({
      questions: {$elemMatch: {$eq: questionRef}}
    });
    if (!quizDoc) {
      return null;
    }

    return await this.quizDocToEntity(quizDoc);
  }

  async create(quiz: Quiz): Promise<Quiz> {
    const quizDoc = await this.QuizModel.create(QuizMapper.toPersistence(quiz));
    return await this.quizDocToEntity(quizDoc);
  }

  async update(quiz: Quiz): Promise<Quiz | null> {
    const quizDoc = await this.QuizModel.findOneAndUpdate(
      {
        _id: quiz.id
      },
      QuizMapper.toPersistence(quiz),
      {new: true}
    );
    if (!quizDoc) {
      throw new DataIntegrityError(QUIZ_NOT_FOUND);
    }

    return await this.quizDocToEntity(quizDoc);
  }

  async delete(quizId: string): Promise<Quiz | null> {
    const quiz = await this.get(quizId);
    if (!quiz) {
      return null;
    }

    await this.QuizModel.findByIdAndDelete(quizId);
    quiz.questions.forEach(async question => {
      switch (question.constructor) {
        case SingleChoiceQuestion: {
          return await this.SingleChoiceQuestionModel.findByIdAndDelete(
            question.id!
          );
        }
        case MultiChoiceQuestion: {
          return await this.MultiChoiceQuestionModel.findByIdAndDelete(
            question.id!
          );
        }
        default: {
          throw new DataIntegrityError(QUESTION_UNKNOWN_CAT_FOUND);
        }
      }
    });

    return quiz;
  }
}
