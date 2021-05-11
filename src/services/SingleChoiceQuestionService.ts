import {EventEmitter} from 'events';
import {SingleChoiceQuestion} from '@/entities';
import {
  CurrentUser,
  QuestionOption,
  QuestionRef,
  StepRef
} from '@/entities/valueObjects';
import {UserRoles, StepCategories, QuestionCategories} from '@/entities/enums';
import {
  BadRequestError,
  DataIntegrityError,
  ForbiddenError,
  NotFoundError
} from '@/errors';
import {IQuestionGateway} from '@/interfaces/gateways';
import {generateId} from '@/interfaces/helpers';
import {
  authorizeUser,
  validateId,
  getQuiz,
  getQuestionLineage,
  getStepLineage
} from './helpers/interfaces';
import {
  CreateSingleChoiceQuestionReqModel,
  UpdateSingleChoiceQuestionReqModel
} from '@/requestModels';
import {
  INVALID_QUESTION_SEQNUM,
  QUIZ_NOT_FOUND,
  SINGLE_CHOICE_QUESTION_NOT_FOUND
} from '@/constants/errors';
import {ISingleChoiceQuestionService} from '@/interfaces/services';
import {SingleChoiceQuestionForAuthorOrAdminResModel} from '@/responseModels/singleChoiceQuestion';
import {
  QUESTION_CREATED,
  QUESTION_DELETED,
  QUESTION_UPDATED
} from '@/constants/events';
import {ObjectsHelper} from '@/helpers';

export default class SingleChoiceQuestionService
  implements ISingleChoiceQuestionService
{
  constructor(
    private singleChoiceQuestionGateway: IQuestionGateway<SingleChoiceQuestion>,
    private authorizeUser: authorizeUser,
    private generateId: generateId,
    private validateId: validateId,
    private getQuiz: getQuiz,
    private getStepLineage: getStepLineage,
    private getLineage: getQuestionLineage,
    private emitter: EventEmitter
  ) {}

  private entityToResModel(
    question: SingleChoiceQuestion,
    fields: string[] | null = null
  ) {
    const {id, description, options, correctOption, availableScore} = fields
      ? ObjectsHelper.projection(question, fields)
      : question;
    return new SingleChoiceQuestionForAuthorOrAdminResModel(
      id,
      description,
      availableScore,
      [...options],
      correctOption
    );
  }

  private async getQuestion(id: string) {
    if (!this.validateId(id)) {
      throw new NotFoundError(SINGLE_CHOICE_QUESTION_NOT_FOUND);
    }

    const question = await this.singleChoiceQuestionGateway.get(id);
    if (!question) {
      throw new NotFoundError(SINGLE_CHOICE_QUESTION_NOT_FOUND);
    }

    return question;
  }

  async create(
    currentUser: CurrentUser | null,
    reqModel: CreateSingleChoiceQuestionReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const {quizId, seqNum, description, correctOption, availableScore} =
      reqModel;

    const quiz = await this.getQuiz(quizId);

    // check current user's authorship of the parent course
    const stepRef = new StepRef(quiz.id!, StepCategories.QUIZ);
    const {course} = await this.getStepLineage(stepRef);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(QUIZ_NOT_FOUND);
    }

    if (seqNum && seqNum > quiz.questions.length) {
      throw new BadRequestError(INVALID_QUESTION_SEQNUM);
    }

    const options = reqModel.options.map(
      (description: string) =>
        new QuestionOption(this.generateId(), description)
    );

    const question = await this.singleChoiceQuestionGateway.create(
      new SingleChoiceQuestion({
        description,
        options,
        correctOption: options[correctOption].id,
        availableScore
      })
    );

    this.emitter.emit(QUESTION_CREATED, {quiz, question, seqNum});

    return this.entityToResModel(question);
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateSingleChoiceQuestionReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const question = await this.getQuestion(id);

    // check current user's authorship of the parent course
    const questionRef = new QuestionRef(id, QuestionCategories.SINGLE_CHOICE);
    const {course, quiz} = await this.getLineage(questionRef);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(SINGLE_CHOICE_QUESTION_NOT_FOUND);
    }

    const {seqNum, description, correctOption, availableScore} = reqModel;
    if (seqNum && seqNum > quiz.questions.length) {
      throw new BadRequestError(
        `'seqNum' should be >= 0 and <= number of questions in the parent quiz.`
      );
    }

    const options = reqModel.options
      ? reqModel.options.map((optionDescription: string) => ({
          id: this.generateId(),
          description: optionDescription
        }))
      : undefined;

    const updatedQuestion = await this.singleChoiceQuestionGateway.update(
      question.update({
        description,
        options,
        correctOption:
          options && correctOption ? options[correctOption].id : undefined,
        availableScore
      })
    );
    if (!updatedQuestion) {
      throw new DataIntegrityError(SINGLE_CHOICE_QUESTION_NOT_FOUND);
    }

    this.emitter.emit(QUESTION_UPDATED, {quiz, question, seqNum});

    return this.entityToResModel(updatedQuestion);
  }

  async delete(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, [UserRoles.ADMIN, UserRoles.AUTHOR]);

    const question = await this.getQuestion(id);

    // check current user's authorship of the parent course
    const questionRef = new QuestionRef(id, QuestionCategories.SINGLE_CHOICE);
    const {course, quiz} = await this.getLineage(questionRef);

    if (currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(SINGLE_CHOICE_QUESTION_NOT_FOUND);
      }

      if (course.isPublished) {
        throw new ForbiddenError();
      }
    }

    const deletedQuestion = await this.singleChoiceQuestionGateway.get(id);
    if (!deletedQuestion) {
      throw new DataIntegrityError(SINGLE_CHOICE_QUESTION_NOT_FOUND);
    }

    this.emitter.emit(QUESTION_DELETED, {quiz, question: deletedQuestion});

    return this.entityToResModel(deletedQuestion);
  }
}
