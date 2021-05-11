import {EventEmitter} from 'events';
import {MultiChoiceQuestion} from '@/entities';
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
  CreateMultiChoiceQuestionReqModel,
  UpdateMultiChoiceQuestionReqModel
} from '@/requestModels';
import {
  QUIZ_NOT_FOUND,
  MULTI_CHOICE_QUESTION_NOT_FOUND,
  INVALID_QUESTION_SEQNUM
} from '@/constants/errors';
import {IMultiChoiceQuestionService} from '@/interfaces/services';
import {
  QUESTION_CREATED,
  QUESTION_DELETED,
  QUESTION_UPDATED
} from '@/constants/events';
import {MultiChoiceQuestionForAuthorOrAdminResModel} from '@/responseModels/multiChoiceQuestion';
import {ObjectsHelper} from '@/helpers';

export default class MultiChoiceQuestionService
  implements IMultiChoiceQuestionService
{
  constructor(
    private multiChoiceQuestionGateway: IQuestionGateway<MultiChoiceQuestion>,
    private authorizeUser: authorizeUser,
    private generateId: generateId,
    private validateId: validateId,
    private getQuiz: getQuiz,
    private getStepLineage: getStepLineage,
    private getLineage: getQuestionLineage,
    private emitter: EventEmitter
  ) {}

  private entityToResModel(
    question: MultiChoiceQuestion,
    fields: string[] | null = null
  ) {
    const {id, description, options, correctOption, availableScore} = fields
      ? ObjectsHelper.projection(question, fields)
      : question;
    return new MultiChoiceQuestionForAuthorOrAdminResModel(
      id,
      description,
      availableScore,
      [...options],
      [...correctOption]
    );
  }

  private async getQuestion(id: string) {
    if (!this.validateId(id)) {
      throw new NotFoundError(MULTI_CHOICE_QUESTION_NOT_FOUND);
    }

    const question = await this.multiChoiceQuestionGateway.get(id);
    if (!question) {
      throw new NotFoundError(MULTI_CHOICE_QUESTION_NOT_FOUND);
    }

    return question;
  }

  async create(
    currentUser: CurrentUser | null,
    reqModel: CreateMultiChoiceQuestionReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const {quizId, seqNum, description, correctOption, availableScore} =
      reqModel;
    const quiz = await this.getQuiz(quizId);

    // check current currentUser's authorship of the parent course
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

    const question = await this.multiChoiceQuestionGateway.create(
      new MultiChoiceQuestion({
        description,
        options,
        correctOption: correctOption.map(i => options[i].id),
        availableScore
      })
    );

    this.emitter.emit(QUESTION_CREATED, {quiz, question, seqNum});

    return this.entityToResModel(question);
  }

  async update(
    currentUser: CurrentUser | null,
    id: string,
    reqModel: UpdateMultiChoiceQuestionReqModel
  ) {
    this.authorizeUser(currentUser, UserRoles.AUTHOR);

    const question = await this.getQuestion(id);

    // check current currentUser's authorship of the parent course
    const questionRef = new QuestionRef(id, QuestionCategories.MULTI_CHOICE);
    const {course, quiz} = await this.getLineage(questionRef);

    if (course.isPublished) {
      throw new ForbiddenError();
    }

    if (currentUser!.id !== course.authorId) {
      throw new NotFoundError(MULTI_CHOICE_QUESTION_NOT_FOUND);
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

    const updatedQuestion = await this.multiChoiceQuestionGateway.update(
      question.update({
        description,
        options,
        correctOption:
          options && correctOption
            ? correctOption.map(i => options[i].id)
            : undefined,
        availableScore
      })
    );
    if (!updatedQuestion) {
      throw new DataIntegrityError(MULTI_CHOICE_QUESTION_NOT_FOUND);
    }

    this.emitter.emit(QUESTION_UPDATED, {quiz, question, seqNum});

    return this.entityToResModel(updatedQuestion);
  }

  async delete(currentUser: CurrentUser | null, id: string) {
    this.authorizeUser(currentUser, [UserRoles.ADMIN, UserRoles.AUTHOR]);

    const question = await this.getQuestion(id);

    // check current currentUser's authorship of the parent course
    const questionRef = new QuestionRef(id, QuestionCategories.MULTI_CHOICE);
    const {course, quiz} = await this.getLineage(questionRef);

    if (currentUser!.role === UserRoles.AUTHOR) {
      if (currentUser!.id !== course.authorId) {
        throw new NotFoundError(MULTI_CHOICE_QUESTION_NOT_FOUND);
      }

      if (course.isPublished) {
        throw new ForbiddenError();
      }
    }

    const deletedQuestion = await this.multiChoiceQuestionGateway.get(id);
    if (!deletedQuestion) {
      throw new DataIntegrityError(MULTI_CHOICE_QUESTION_NOT_FOUND);
    }

    this.emitter.emit(QUESTION_DELETED, {quiz, question: deletedQuestion});

    return this.entityToResModel(deletedQuestion);
  }
}
