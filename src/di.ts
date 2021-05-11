import {EventEmitter} from 'events';
import mongooseConnection from '@/db/mongo';
import {
  makeUserModel,
  makeEnrollmentModel,
  makeScheduledEventModel,
  makeFinishedStepModel,
  makeCourseModel,
  makeWeekModel,
  makeLectureModel,
  makeReadingModel,
  makeQuizModel,
  makeSingleChoiceQuestionModel,
  makeMultiChoiceQuestionModel,
  makeQuizAttemptModel,
  makeSingleChoiceQuestionResponseModel,
  makeMultiChoiceQuestionResponseModel,
  makeRefreshTokenModel,
  makeFinishedCourseModel,
  makeCourseCategoryModel
} from '@/gateways/mongo/models';
import {
  UserGateway,
  EnrollmentGateway,
  ScheduledEventGateway,
  FinishedStepGateway,
  CourseGateway,
  FinishedCourseGateway,
  WeekGateway,
  LectureGateway,
  ReadingGateway,
  QuizGateway,
  SingleChoiceQuestionGateway,
  MultiChoiceQuestionGateway,
  QuizAttemptGateway,
  RefreshTokenGateway,
  CourseCategoryGateway
} from '@/gateways/mongo';
import {
  UserService,
  MailerService,
  CourseService,
  WeekService,
  LectureService,
  QuizService,
  SingleChoiceQuestionService,
  MultiChoiceQuestionService,
  QuizAttemptService,
  CourseCategoryService
} from '@/services';
import {
  UserController,
  CourseController,
  WeekController,
  LectureController,
  ReadingController,
  QuizController,
  SingleChoiceQuestionController,
  MultiChoiceQuestionController,
  QuizAttemptController,
  CourseCategoryController,
  ScheduledEventController,
} from '@/controllers';
import {generateObjectId} from '@/helpers';
import {
  HashingHelper,
  authorizeUser,
  validateObjectId,
  getFieldsQuery,
  buildGetQuiz,
  buildGetStepLineage,
  buildGetQuestionLineage
} from '@/services/helpers';
import config from '@/config';
import {
  courseSubscriber,
  emailSubscriber,
  finishedCourseSubscriber,
  finishedStepSubscriber,
  quizSubscriber,
  quizAttemptSubscriber,
  stepSubscriber,
  weekSubscriber
} from './subscribers';
import ScheduledEventService from './services/ScheduledEventService';
import {
  buildPopulateQuestions,
  buildQuizDocToEntity,
  multiChoiceQuestionDocToEntity,
  singleChoiceQuestionDocToEntity,
  buildGetQuiz as buildGetQuizFromDb
} from './gateways/mongo/helpers';
import ReadingService from './services/ReadingService';

const UserModel = makeUserModel(mongooseConnection);

const EnrollmentModel = makeEnrollmentModel(mongooseConnection);

const RefreshTokenModel = makeRefreshTokenModel(mongooseConnection);

const ScheduledEventModel = makeScheduledEventModel(mongooseConnection);

const FinishedStepModel = makeFinishedStepModel(mongooseConnection);

const CourseModel = makeCourseModel(mongooseConnection);

const CourseCategoryModel = makeCourseCategoryModel(mongooseConnection);

const FinishedCourseModel = makeFinishedCourseModel(mongooseConnection);

const WeekModel = makeWeekModel(mongooseConnection);

const LectureModel = makeLectureModel(mongooseConnection);

const ReadingModel = makeReadingModel(mongooseConnection);

const QuizModel = makeQuizModel(mongooseConnection);

const SingleChoiceQuestionModel =
  makeSingleChoiceQuestionModel(mongooseConnection);

const MultiChoiceQuestionModel =
  makeMultiChoiceQuestionModel(mongooseConnection);

const QuizAttemptModel = makeQuizAttemptModel(mongooseConnection);

const SingleChoiceQuestionResponseModel =
  makeSingleChoiceQuestionResponseModel(mongooseConnection);

const MultiChoiceQuestionResponseModel =
  makeMultiChoiceQuestionResponseModel(mongooseConnection);

const userGateway = new UserGateway(UserModel);

const refreshTokenGateway = new RefreshTokenGateway(RefreshTokenModel);

const enrollmentGateway = new EnrollmentGateway(EnrollmentModel);

const scheduledEventGateway = new ScheduledEventGateway(ScheduledEventModel);

const finishedStepGateway = new FinishedStepGateway(FinishedStepModel);

const courseGateway = new CourseGateway(CourseModel);

const courseCategoryGateway = new CourseCategoryGateway(CourseCategoryModel);

const finishedCourseGateway = new FinishedCourseGateway(FinishedCourseModel);

const weekGateway = new WeekGateway(WeekModel);

const lectureGateway = new LectureGateway(LectureModel);

const readingGateway = new ReadingGateway(ReadingModel);

const populateQuestions = buildPopulateQuestions(
  SingleChoiceQuestionModel,
  MultiChoiceQuestionModel,
  singleChoiceQuestionDocToEntity,
  multiChoiceQuestionDocToEntity
);
const quizDocToEntity = buildQuizDocToEntity(populateQuestions);
const getQuizFromDb = buildGetQuizFromDb(QuizModel, quizDocToEntity);

const quizGateway = new QuizGateway(
  QuizModel,
  SingleChoiceQuestionModel,
  MultiChoiceQuestionModel,
  quizDocToEntity,
  getQuizFromDb
);

const singleChoiceQuestionGateway = new SingleChoiceQuestionGateway(
  SingleChoiceQuestionModel
);

const multiChoiceQuestionGateway = new MultiChoiceQuestionGateway(
  MultiChoiceQuestionModel
);

const quizAttemptGateway = new QuizAttemptGateway(
  SingleChoiceQuestionModel,
  MultiChoiceQuestionModel,
  QuizAttemptModel,
  SingleChoiceQuestionResponseModel,
  MultiChoiceQuestionResponseModel,
  getQuizFromDb,
  singleChoiceQuestionDocToEntity,
  multiChoiceQuestionDocToEntity
);

const {
  app: {
    email: {host, username, password}
  }
} = config;

const hashingHelper = new HashingHelper();

const mailerService = new MailerService(host, {
  username: username,
  password: password
});

const emitter = new EventEmitter();

emailSubscriber(emitter, mailerService);

courseSubscriber(
  courseGateway,
  weekGateway,
  finishedStepGateway,
  quizAttemptGateway,
  emitter
);

finishedCourseSubscriber(
  finishedCourseGateway,
  weekGateway,
  quizGateway,
  quizAttemptGateway,
  finishedStepGateway,
  emitter
);

weekSubscriber(weekGateway, emitter);

stepSubscriber(lectureGateway, readingGateway, quizGateway, emitter);

finishedStepSubscriber(finishedStepGateway, emitter);

quizSubscriber(quizGateway, emitter);

quizAttemptSubscriber(quizAttemptGateway, emitter);

const userService = new UserService(
  userGateway,
  refreshTokenGateway,
  hashingHelper,
  authorizeUser,
  validateObjectId,
  getFieldsQuery,
  emitter
);

const courseService = new CourseService(
  courseGateway,
  courseCategoryGateway,
  finishedCourseGateway,
  enrollmentGateway,
  authorizeUser,
  validateObjectId,
  getFieldsQuery,
  emitter
);

const courseCategoryService = new CourseCategoryService(
  courseCategoryGateway,
  authorizeUser,
  validateObjectId,
  getFieldsQuery
);

const weekService = new WeekService(
  courseGateway,
  weekGateway,
  enrollmentGateway,
  finishedStepGateway,
  quizGateway,
  quizAttemptGateway,
  authorizeUser,
  validateObjectId,
  getFieldsQuery,
  emitter
);

const getStepLineage = buildGetStepLineage(courseGateway, weekGateway);

const scheduledEventService = new ScheduledEventService(
  scheduledEventGateway,
  enrollmentGateway,
  authorizeUser,
  validateObjectId,
  getStepLineage
);

const lectureService = new LectureService(
  courseGateway,
  weekGateway,
  finishedStepGateway,
  enrollmentGateway,
  lectureGateway,
  authorizeUser,
  validateObjectId,
  getStepLineage,
  getFieldsQuery,
  emitter
);

const readingService = new ReadingService(
  courseGateway,
  weekGateway,
  finishedStepGateway,
  enrollmentGateway,
  readingGateway,
  authorizeUser,
  validateObjectId,
  getStepLineage,
  getFieldsQuery,
  emitter
);

const getQuiz = buildGetQuiz(quizGateway, validateObjectId);

const quizService = new QuizService(
  courseGateway,
  weekGateway,
  enrollmentGateway,
  quizGateway,
  quizAttemptGateway,
  finishedStepGateway,
  authorizeUser,
  validateObjectId,
  getQuiz,
  getStepLineage,
  getFieldsQuery,
  emitter
);

const getQuestionLineage = buildGetQuestionLineage(getStepLineage, quizGateway);

const singleChoiceQuestionService = new SingleChoiceQuestionService(
  singleChoiceQuestionGateway,
  authorizeUser,
  generateObjectId,
  validateObjectId,
  getQuiz,
  getStepLineage,
  getQuestionLineage,
  emitter
);

const multiChoiceQuestionService = new MultiChoiceQuestionService(
  multiChoiceQuestionGateway,
  authorizeUser,
  generateObjectId,
  validateObjectId,
  getQuiz,
  getStepLineage,
  getQuestionLineage,
  emitter
);

const quizAttemptService = new QuizAttemptService(
  quizAttemptGateway,
  enrollmentGateway,
  finishedStepGateway,
  authorizeUser,
  getQuiz,
  getStepLineage,
  getFieldsQuery,
  emitter
);

export const userController = new UserController(userService);

export const courseController = new CourseController(courseService);

export const courseCategoryController = new CourseCategoryController(
  courseCategoryService
);

export const weekController = new WeekController(weekService);

export const scheduledEventController = new ScheduledEventController(
  scheduledEventService
);

export const lectureController = new LectureController(lectureService);

export const readingController = new ReadingController(readingService);

export const quizController = new QuizController(quizService);

export const singleChoiceQuestionController =
  new SingleChoiceQuestionController(singleChoiceQuestionService);

export const multiChoiceQuestionController = new MultiChoiceQuestionController(
  multiChoiceQuestionService
);

export const quizAttemptController = new QuizAttemptController(
  quizAttemptService
);
