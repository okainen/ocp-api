import Joi from 'joi';
import {EventEmitter} from 'events';
import {
  Quiz,
  SingleChoiceQuestion,
  MultiChoiceQuestion,
  SingleChoiceQuestionResponse,
  MultiChoiceQuestionResponse
} from '@/entities';
import {CurrentUser, QuestionRef, StepRef} from '@/entities/valueObjects';
import {UserRoles, StepCategories} from '@/entities/enums';
import {
  BadRequestError,
  DataIntegrityError,
  ForbiddenError,
  NotFoundError
} from '@/errors';
import {
  IWeekGateway,
  IQuizGateway,
  ICourseGateway,
  IEnrollmentGateway,
  IFinishedStepGateway,
  IQuizAttemptGateway
} from '@/interfaces/gateways';
import {CreateStepReqModel, UpdateStepReqModel} from '@/requestModels';
import {
  COURSE_NOT_FOUND,
  INVALID_STEP_SEQNUM,
  NOT_ENROLLED,
  QUESTION_UNKNOWN_CAT_FOUND,
  QUIZ_ATTEMPT_NOT_FOUND,
  QUIZ_NOT_FOUND,
  WEEK_NOT_FOUND
} from '@/constants/errors';
import {
  QUIZ_DELETED,
  STEP_CREATED,
  STEP_DELETED,
  STEP_UPDATED
} from '@/constants/events';
import {
  SingleChoiceQuestionResModel,
  SingleChoiceQuestionForAuthorOrAdminResModel
} from '../responseModels/singleChoiceQuestion';
import {
  MultiChoiceQuestionResModel,
  MultiChoiceQuestionForAuthorOrAdminResModel
} from '../responseModels/multiChoiceQuestion';
import {
  QuizResModel,
  QuizForAuthorOrAdminResModel,
  AnsweredSingleChoiceQuestionResModel,
  AnsweredMultiChoiceQuestionResModel,
  QuizForStudentResModel
} from '../responseModels/quiz';
import {ObjectsHelper} from '@/helpers';
import {IQuizService} from '@/interfaces/services';
import {
  authorizeUser,
  getStepLineage,
  validateId,
  getQuiz,
  getFieldsQuery
} from './helpers/interfaces';

export default class QuizService implements IQuizService {
  constructor(
    private courseGateway: ICourseGateway,
    private weekGateway: IWeekGateway,
    private enrollmentGateway: IEnrollmentGateway,
    private quizGateway: IQuizGateway,
    private quizAttemptGateway: IQuizAttemptGateway,
    private finishedStepGateway: IFinishedStepGateway,
    private authorizeUser: authorizeUser,
    private validateId: validateId,
    private getQuiz: getQuiz,
    private getLineage: getStepLineage,
    private getFieldsQuery: getFieldsQuery,
    private emitter: EventEmitter
  ) {}

  private async getForAuthorOrAdmin(
    quiz: Quiz,
    fields: string[] | null = null
  ) {
    const {id, name, estimatedEffort, modifiedAt, createdAt} = fields
      ? ObjectsHelper.projection(quiz, fields)
      : quiz;
    const questionResModels =
      !fields || fields.length == 0 || fields.includes('questions')
        ? quiz.questions.map(question => {
            switch (question.constructor) {
              case SingleChoiceQuestion: {
                const {
                  id,
                  description,
                  options,
                  correctOption,
                  availableScore
                } = question as SingleChoiceQuestion;
                return new SingleChoiceQuestionForAuthorOrAdminResModel(
                  id!,
                  description,
                  availableScore,
                  [...options],
                  correctOption
                );
              }
              case MultiChoiceQuestion: {
                const {
                  id,
                  description,
                  options,
                  correctOption,
                  availableScore
                } = question as MultiChoiceQuestion;
                return new MultiChoiceQuestionForAuthorOrAdminResModel(
                  id!,
                  description,
                  availableScore,
                  [...options],
                  [...correctOption]
                );
              }
              default: {
                throw new DataIntegrityError(QUESTION_UNKNOWN_CAT_FOUND);
              }
            }
          })
        : undefined;
    const quizResModel = new QuizForAuthorOrAdminResModel(
      id!,
      name,
      questionResModels,
      estimatedEffort,
      modifiedAt,
      createdAt
    );

    return quizResModel;
  }

  private async getForStudent(
    quiz: Quiz,
    studentId: string,
    fields: string[] | null = null
  ) {
    const {id, name, estimatedEffort} = fields
      ? ObjectsHelper.projection(quiz, fields)
      : quiz;
    const stepRef = new StepRef(quiz.id!, StepCategories.QUIZ);
    const finishedStep = await this.finishedStepGateway.get(studentId, stepRef);
    const quizAttempt = finishedStep
      ? await this.quizAttemptGateway.get(studentId, quiz.id!)
      : null;
    if (finishedStep && !quizAttempt) {
      throw new DataIntegrityError(QUIZ_ATTEMPT_NOT_FOUND);
    }
    const questionResModels =
      !fields || fields.length == 0 || fields.includes('questions')
        ? quiz.questions.map((question, i) => {
            switch (question.constructor) {
              case SingleChoiceQuestion: {
                const singleChoiceQuestion = question as SingleChoiceQuestion;
                const {id, description, options, availableScore} =
                  singleChoiceQuestion;

                if (finishedStep) {
                  const {correctOption} = singleChoiceQuestion;
                  const {choice, score} = quizAttempt!.response[
                    i
                  ] as SingleChoiceQuestionResponse;

                  return new AnsweredSingleChoiceQuestionResModel(
                    id,
                    description,
                    availableScore,
                    [...options],
                    correctOption,
                    choice,
                    score
                  );
                }

                return new SingleChoiceQuestionResModel(
                  id!,
                  description,
                  availableScore,
                  [...options]
                );
              }
              case MultiChoiceQuestion: {
                const multiChoiceQuestion = question as MultiChoiceQuestion;
                const {id, description, options, availableScore} =
                  multiChoiceQuestion;

                if (finishedStep) {
                  const {correctOption} = multiChoiceQuestion;
                  const {choice, score} = quizAttempt!.response[
                    i
                  ] as MultiChoiceQuestionResponse;

                  return new AnsweredMultiChoiceQuestionResModel(
                    id,
                    description,
                    availableScore,
                    [...options],
                    [...correctOption],
                    [...choice],
                    score
                  );
                }

                return new MultiChoiceQuestionResModel(
                  id!,
                  description,
                  availableScore,
                  [...options]
                );
              }
              default: {
                throw new DataIntegrityError(QUESTION_UNKNOWN_CAT_FOUND);
              }
            }
          })
        : undefined;
    const quizResModel = new QuizForStudentResModel(
      id!,
      name,
      questionResModels,
      estimatedEffort
    );

    return quizResModel;
  }

  async create(currentUser: CurrentUser | null, reqModel: CreateStepReqModel) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const {weekId, seqNum, name, estimatedEffort} = reqModel;
    if (!this.validateId(weekId)) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    // check current user's authorship of the parent course
    const week = await this.weekGateway.get(weekId);
    if (!week) {
      throw new NotFoundError(WEEK_NOT_FOUND);
    }

    const course = await this.courseGateway.getByWeekId(week.id!);
    if (!course) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    if (seqNum && seqNum > week.steps.length) {
      throw new BadRequestError(INVALID_STEP_SEQNUM);
    }

    const quiz = await this.quizGateway.create(
      new Quiz({name, estimatedEffort})
    );

    const stepRef = new StepRef(quiz.id!, StepCategories.QUIZ);
    this.emitter.emit(STEP_CREATED, {week, stepRef, seqNum});

    return this.getForAuthorOrAdmin(quiz);
  }

  async get(currentUser: CurrentUser | null, id: string, queryParams: any) {
    const fields = this.getFieldsQuery(queryParams);

    const quiz = await this.getQuiz(id);

    // get parent course
    const stepRef = new StepRef(quiz.id!, StepCategories.QUIZ);
    const {course} = await this.getLineage(stepRef);

    if (currentUser && currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(COURSE_NOT_FOUND);
      }

      return this.getForAuthorOrAdmin(quiz, fields);
    }

    if (!course.isPublished) {
      throw new NotFoundError(COURSE_NOT_FOUND);
    }

    const {name, estimatedEffort} = quiz;
    if (!currentUser) {
      return new QuizResModel(id, name, undefined, estimatedEffort);
    }

    const enrollment = await this.enrollmentGateway.get(
      course.id!,
      currentUser!.id
    );

    if (!enrollment) {
      throw new ForbiddenError(NOT_ENROLLED);
    }

    return this.getForStudent(quiz, currentUser!.id, fields);
  }

  async getQuestionLineage(questionRef: QuestionRef) {
    const quiz = await this.quizGateway.getByQuestionRef(questionRef);
    if (!quiz) {
      throw new DataIntegrityError(QUIZ_NOT_FOUND);
    }

    const stepRef = new StepRef(quiz.id!, StepCategories.QUIZ);
    const {course, week} = await this.getLineage(stepRef);

    return {course, week, quiz};
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateStepReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const stepRef = new StepRef(id, StepCategories.QUIZ);
    const {course, week} = await this.getLineage(stepRef);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(QUIZ_NOT_FOUND);
    }

    const {seqNum, name, estimatedEffort} = reqModel;
    if (seqNum && seqNum > course.weekIds.length) {
      throw new BadRequestError(INVALID_STEP_SEQNUM);
    }

    const quiz = await this.getQuiz(id);
    const updatedQuiz = await this.quizGateway.update(
      quiz.update({
        name,
        estimatedEffort
      })
    );
    if (!updatedQuiz) {
      throw new DataIntegrityError(QUIZ_NOT_FOUND);
    }

    this.emitter.emit(STEP_UPDATED, {week, stepRef, seqNum});
    return this.getForAuthorOrAdmin(updatedQuiz);
  }

  async delete(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, [UserRoles.ADMIN, UserRoles.AUTHOR]);

    // check current user's authorship of the parent course
    const stepRef = new StepRef(id, StepCategories.QUIZ);
    const {course, week} = await this.getLineage(stepRef);

    if (currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(QUIZ_NOT_FOUND);
      }

      if (course.isPublished) {
        throw new ForbiddenError();
      }
    }

    const quiz = await this.quizGateway.delete(id);
    if (!quiz) {
      throw new NotFoundError(QUIZ_NOT_FOUND);
    }

    this.emitter.emit(QUIZ_DELETED, quiz);
    this.emitter.emit(STEP_DELETED, {week, stepRef});

    return quiz;
  }
}
