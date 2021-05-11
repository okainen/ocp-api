import Joi from 'joi';
import {EventEmitter} from 'events';
import {
  QuizAttempt,
  SingleChoiceQuestionResponse,
  MultiChoiceQuestionResponse,
  QuestionResponse,
  Quiz,
  SingleChoiceQuestion,
  MultiChoiceQuestion
} from '@/entities';
import {CurrentUser, StepRef} from '@/entities/valueObjects';
import {UserRoles, StepCategories} from '@/entities/enums';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
  DataIntegrityError
} from '@/errors';
import {
  IQuizAttemptGateway,
  IEnrollmentGateway,
  IFinishedStepGateway
} from '@/interfaces/gateways';
import {QuizAttemptReqModel} from '@/requestModels';
import {
  MultiChoiceQuestionResponseResModel,
  QuizAttemptResModel,
  SingleChoiceQuestionResponseResModel
} from '@/responseModels/quizAttempt';
import {
  INVALID_QUERY_PARAMS,
  NOT_ENROLLED,
  QUESTION_RESPONSE_UNKNOWN_CAT_FOUND,
  QUIZ_ATTEMPT_ALREADY_EXISTS,
  QUIZ_ATTEMPT_NOT_FOUND
} from '@/constants/errors';
import {IQuizAttemptService} from '@/interfaces/services';
import {QUIZ_ATTEMPT_SUBMITTED} from '@/constants/events';
import {ObjectsHelper} from '@/helpers';
import {
  authorizeUser,
  getQuiz,
  getStepLineage,
  getFieldsQuery
} from './helpers/interfaces';

export default class QuizAttemptService implements IQuizAttemptService {
  constructor(
    private quizAttemptGateway: IQuizAttemptGateway,
    private enrollmentGateway: IEnrollmentGateway,
    private finishedStepGateway: IFinishedStepGateway,
    private authorizeUser: authorizeUser,
    private getQuiz: getQuiz,
    private getLineage: getStepLineage,
    private getFieldsQuery: getFieldsQuery,
    private emitter: EventEmitter
  ) {}

  private async reqModelToEntity(
    quiz: Quiz,
    studentId: string,
    reqModel: QuizAttemptReqModel
  ) {
    const {response} = reqModel;
    const {questions} = quiz;
    const questionResponses = response.map((questionResponse, i) =>
      questionResponse
        ? (() => {
            const {choice} = questionResponse;
            const question = questions[i];
            if (typeof choice === 'string') {
              return new SingleChoiceQuestionResponse({
                question: question as SingleChoiceQuestion,
                choice
              });
            }
            return new MultiChoiceQuestionResponse({
              question: question as MultiChoiceQuestion,
              choice
            });
          })()
        : questionResponse
    );
    return new QuizAttempt({quiz, studentId, response: questionResponses});
  }

  private getQuestionResponseResModel = (
    questionResponse: QuestionResponse
  ) => {
    switch (questionResponse.constructor) {
      case SingleChoiceQuestionResponse: {
        const singleChoiceQuestionResponse =
          questionResponse as SingleChoiceQuestionResponse;
        const {choice} = singleChoiceQuestionResponse;
        return new SingleChoiceQuestionResponseResModel(choice);
      }
      case MultiChoiceQuestionResponse: {
        const multiChoiceQuestionResponse =
          questionResponse as MultiChoiceQuestionResponse;
        const {choice} = multiChoiceQuestionResponse;
        return new MultiChoiceQuestionResponseResModel([...choice]);
      }
      default: {
        throw new DataIntegrityError(QUESTION_RESPONSE_UNKNOWN_CAT_FOUND);
      }
    }
  };

  private getQuestionResponseResModels = (quizAttempt: QuizAttempt) =>
    quizAttempt.response.map((questionResponse: QuestionResponse | null) => {
      if (!questionResponse) {
        return {};
      }
      return this.getQuestionResponseResModel(questionResponse);
    });

  private entityToResModel(
    quizAttempt: QuizAttempt,
    isFinal: boolean = false,
    fields: string[] | null = null
  ) {
    const {response, createdAt} = fields
      ? ObjectsHelper.projection(quizAttempt, fields)
      : quizAttempt;

    return new QuizAttemptResModel(
      response ? this.getQuestionResponseResModels(quizAttempt) : undefined,
      fields
        ? fields.includes('isFinal')
          ? isFinal
          : undefined
        : isFinal || undefined,
      createdAt
    );
  }

  async submit(
    currentUser: CurrentUser | null,
    quizId: string,
    reqModel: QuizAttemptReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    if (await this.quizAttemptGateway.get(currentUser!.id, quizId)) {
      throw new ConflictError(QUIZ_ATTEMPT_ALREADY_EXISTS);
    }

    const quiz = await this.getQuiz(quizId);

    //check if the current currentUser is enrolled in the parent course
    const stepRef = new StepRef(quizId, StepCategories.QUIZ);
    const {course} = await this.getLineage(stepRef);

    const enrollment = await this.enrollmentGateway.get(
      course.id!,
      currentUser!.id
    );
    if (!enrollment) {
      throw new ForbiddenError(NOT_ENROLLED);
    }

    const quizAttempt = await this.reqModelToEntity(
      quiz,
      currentUser!.id,
      reqModel
    );
    const {missingQuestionResponses} = quizAttempt;
    if (missingQuestionResponses.length !== 0) {
      throw new BadRequestError(
        `Missing answers for questions: ${JSON.stringify(
          missingQuestionResponses
        )}`
      );
    }

    const createdQuizAttempt = await this.quizAttemptGateway.create(
      quizAttempt
    );

    this.emitter.emit(QUIZ_ATTEMPT_SUBMITTED, {
      studentId: currentUser!.id,
      course,
      stepId: quiz.id!
    });

    return this.entityToResModel(createdQuizAttempt);
  }

  async get(currentUser: CurrentUser | null, quizId: string, queryParams: any) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const fields = this.getFieldsQuery(queryParams);

    const quiz = await this.getQuiz(quizId);

    const quizAttempt = await this.quizAttemptGateway.get(
      currentUser!.id,
      quizId
    );
    if (!quizAttempt) {
      throw new NotFoundError(QUIZ_ATTEMPT_NOT_FOUND);
    }

    const existingFinishedStep = await this.finishedStepGateway.get(
      currentUser!.id,
      new StepRef(quizId, StepCategories.QUIZ)
    );

    return this.entityToResModel(quizAttempt, !!existingFinishedStep, fields);
  }

  async save(
    currentUser: CurrentUser | null,
    quizId: string,
    reqModel: QuizAttemptReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.STUDENT);

    const quiz = await this.getQuiz(quizId);

    await this.quizAttemptGateway.delete(currentUser!.id, quizId);

    //check if the current currentUser is enrolled in the parent course
    const stepRef = new StepRef(quizId, StepCategories.QUIZ);
    const {course} = await this.getLineage(stepRef);

    const enrollment = await this.enrollmentGateway.get(
      course.id!,
      currentUser!.id
    );
    if (!enrollment) {
      throw new ForbiddenError(NOT_ENROLLED);
    }

    const quizAttempt = await this.reqModelToEntity(
      quiz,
      currentUser!.id,
      reqModel
    );
    const createdQuizAttempt = await this.quizAttemptGateway.create(
      quizAttempt
    );

    return this.entityToResModel(createdQuizAttempt);
  }
}
