import {Model} from 'mongoose';
import {MultiChoiceQuestionResponse, QuizAttempt} from '@/entities';
import {IQuizAttemptGateway} from '@/interfaces/gateways';
import {QuizAttemptMapper} from '@/mappers';
import {
  MultiChoiceQuestionDoc,
  MultiChoiceQuestionResponseDoc,
  QuestionResponseRefDoc,
  QuizAttemptDoc,
  SingleChoiceQuestionDoc,
  SingleChoiceQuestionResponseDoc
} from './models/types';
import {SingleChoiceQuestionResponse} from '@/entities';
import {DataIntegrityError} from '@/errors';
import {QuestionCategories} from '@/entities/enums';
import {
  MULTI_CHOICE_QUESTION_NOT_FOUND,
  MULTI_CHOICE_QUESTION_RESPONSE_NOT_FOUND,
  QUESTION_UNKNOWN_CAT_FOUND,
  QUIZ_ATTEMPT_NOT_FOUND,
  QUIZ_NOT_FOUND,
  SINGLE_CHOICE_QUESTION_NOT_FOUND,
  SINGLE_CHOICE_QUESTION_RESPONSE_NOT_FOUND
} from '@/constants/errors';
import {
  multiChoiceQuestionDocToEntity,
  singleChoiceQuestionDocToEntity,
  getQuiz
} from './helpers/interfaces';

export default class QuizAttemptGateway implements IQuizAttemptGateway {
  constructor(
    private SingleChoiceQuestionModel: Model<SingleChoiceQuestionDoc, {}, {}>,
    private MultiChoiceQuestionModel: Model<MultiChoiceQuestionDoc, {}, {}>,
    private QuizAttemptModel: Model<QuizAttemptDoc, {}, {}>,
    private SingleChoiceQuestionResponseModel: Model<
      SingleChoiceQuestionResponseDoc,
      {},
      {}
    >,
    private MultiChoiceQuestionResponseModel: Model<
      MultiChoiceQuestionResponseDoc,
      {},
      {}
    >,
    private getQuiz: getQuiz,
    private singleChoiceQuestioDocToEntity: singleChoiceQuestionDocToEntity,
    private multiChoiceQuestioDocToEntity: multiChoiceQuestionDocToEntity
  ) {}

  private async quizAttemptDocToQuizAttempt(quizAttemptDoc: QuizAttemptDoc) {
    const {quizId, studentId, createdAt} = quizAttemptDoc;
    const quiz = await this.getQuiz(quizId);
    if (!quiz) {
      throw new DataIntegrityError(QUIZ_NOT_FOUND);
    }

    const response = await this.populateQuestionResponses(
      quizAttemptDoc.response
    );
    return new QuizAttempt({quiz, studentId, response, createdAt});
  }

  private async populateQuestionResponses(
    questionResponseRefs: QuestionResponseRefDoc[]
  ) {
    return await Promise.all(
      questionResponseRefs.map(async questionResponseRef => {
        const {questionResponseId, questionCategory} = questionResponseRef;
        switch (questionCategory) {
          case QuestionCategories.SINGLE_CHOICE: {
            const questionResponseDoc =
              await this.SingleChoiceQuestionResponseModel.findById(
                questionResponseId
              );
            if (!questionResponseDoc) {
              throw new DataIntegrityError(
                SINGLE_CHOICE_QUESTION_RESPONSE_NOT_FOUND
              );
            }

            const {_id: id, questionId, choice} = questionResponseDoc;

            const questionDoc = await this.SingleChoiceQuestionModel.findById(
              questionId
            );
            if (!questionDoc) {
              throw new DataIntegrityError(SINGLE_CHOICE_QUESTION_NOT_FOUND);
            }

            const question = this.singleChoiceQuestioDocToEntity(questionDoc);

            return new SingleChoiceQuestionResponse({
              id,
              question,
              choice
            });
          }
          case QuestionCategories.MULTI_CHOICE: {
            const questionResponseDoc =
              await this.MultiChoiceQuestionResponseModel.findById(
                questionResponseId
              );
            if (!questionResponseDoc) {
              throw new DataIntegrityError(
                MULTI_CHOICE_QUESTION_RESPONSE_NOT_FOUND
              );
            }

            const {_id: id, questionId, choice} = questionResponseDoc;

            const questionDoc = await this.MultiChoiceQuestionModel.findById(
              questionId
            );
            if (!questionDoc) {
              throw new DataIntegrityError(MULTI_CHOICE_QUESTION_NOT_FOUND);
            }

            const question = this.multiChoiceQuestioDocToEntity(questionDoc);

            return new MultiChoiceQuestionResponse({
              id,
              question,
              choice
            });
          }
          default: {
            throw new DataIntegrityError(QUESTION_UNKNOWN_CAT_FOUND);
          }
        }
      })
    );
  }

  async get(studentId: string, quizId: string): Promise<QuizAttempt | null> {
    const quizAttemptDoc = await this.QuizAttemptModel.findOne({
      quizId,
      studentId
    });
    if (!quizAttemptDoc) {
      return null;
    }

    return await this.quizAttemptDocToQuizAttempt(quizAttemptDoc);
  }

  async create(quizAttempt: QuizAttempt): Promise<QuizAttempt> {
    const response = await Promise.all(
      quizAttempt.response.map(async questionResponse => {
        if (!questionResponse) {
          return null;
        }
        switch (questionResponse.constructor) {
          case SingleChoiceQuestionResponse: {
            const singleChoiceQuestionResponse =
              questionResponse as SingleChoiceQuestionResponse;
            const {_id} = await this.SingleChoiceQuestionResponseModel.create(
              singleChoiceQuestionResponse
            );
            return new SingleChoiceQuestionResponse({
              ...singleChoiceQuestionResponse,
              id: _id
            });
          }
          default: {
            const multiChoiceQuestionResponse =
              questionResponse as MultiChoiceQuestionResponse;
            const {_id, choice} =
              await this.MultiChoiceQuestionResponseModel.create(
                multiChoiceQuestionResponse
              );
            return new MultiChoiceQuestionResponse({
              ...multiChoiceQuestionResponse,
              id: _id,
              choice: [...choice]
            });
          }
        }
      })
    );

    const quizAttemptDoc = await this.QuizAttemptModel.create(
      QuizAttemptMapper.toPersistence(
        new QuizAttempt({...quizAttempt, response})
      )
    );
    return await this.quizAttemptDocToQuizAttempt(quizAttemptDoc);
  }

  async delete(studentId: string, quizId: string): Promise<QuizAttempt | null> {
    const quizAttempt = await this.get(studentId, quizId);
    if (!quizAttempt) {
      return null;
    }

    await this.QuizAttemptModel.deleteOne({studentId, quizId});
    quizAttempt.response.forEach(async questionResponse => {
      if (questionResponse) {
        switch (questionResponse.constructor) {
          case SingleChoiceQuestionResponse: {
            return await this.SingleChoiceQuestionResponseModel.findByIdAndDelete(
              questionResponse.id!
            );
          }
          case MultiChoiceQuestionResponse: {
            return await this.MultiChoiceQuestionResponseModel.findByIdAndDelete(
              questionResponse.id!
            );
          }
          default: {
            throw new DataIntegrityError(QUESTION_UNKNOWN_CAT_FOUND);
          }
        }
      }
    });

    return quizAttempt;
  }

  async deleteByQuizId(quizId: string): Promise<QuizAttempt[] | null> {
    const studentIds = (await this.QuizAttemptModel.find({quizId})).map(
      quizAttemptDoc => quizAttemptDoc.studentId
    );

    const quizAttempts = await Promise.all(
      studentIds.map(studentId => this.delete(studentId, quizId))
    );
    quizAttempts.forEach(quizAttempt => {
      if (!quizAttempt) {
        throw new DataIntegrityError(QUIZ_ATTEMPT_NOT_FOUND);
      }
    });

    return quizAttempts as QuizAttempt[];
  }
}
