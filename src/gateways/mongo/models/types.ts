import {QuestionCategories, StepCategories, UserRoles} from '@/entities/enums';

export type UserDoc = {
  _id: string;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName?: string;
  role: UserRoles;
  isActive: boolean;
  imgPath?: string;
  modifiedAt: Date;
  createdAt: Date;
};

export type RefreshTokenDoc = {
  _id: string;
  userId: string;
  ttl: number;
  createdAt: Date;
};

export type CourseDoc = {
  _id: string;
  authorId: string;
  name: string;
  description: string;
  categoryIds: string[];
  weekIds: string[];
  imgPath?: string;
  isPublished?: boolean;
  modifiedAt: Date;
  createdAt: Date;
};

export type EnrollmentDoc = {
  _id: string;
  studentId: string;
  courseId: string;
  createdAt: Date;
};

export type FinishedCourseDoc = {
  studentId: string;
  courseId: string;
  score: number;
  createdAt: Date;
};

export type CourseCategoryDoc = {
  _id: string;
  name: string;
  modifiedAt: Date;
  createdAt: Date;
};

export type StepRefDoc = {
  stepCategory: StepCategories;
  stepId: string;
};

export type WeekDoc = {
  _id: string;
  name: string;
  description: string;
  steps: StepRefDoc[];
  modifiedAt: Date;
  createdAt: Date;
};

export type TimespanDoc = {
  beginning: Date;
  end: Date;
};

export type ScheduledEventDoc = {
  _id: string;
  studentId: string;
  stepRef: StepRefDoc;
  timespan: TimespanDoc;
};

export type FinishedStepDoc = {
  studentId: string;
  stepRef: StepRefDoc;
  createdAt: Date;
};

export type LectureDoc = {
  _id: string;
  name: string;
  videoPath: string;
  estimatedEffort: number;
  modifiedAt: Date;
  createdAt: Date;
};

export type ReadingDoc = {
  _id: string;
  name: string;
  docPath: string;
  estimatedEffort: number;
  modifiedAt: Date;
  createdAt: Date;
};

export type QuestionRefDoc = {
  questionCategory: QuestionCategories;
  questionId: string;
};

export type QuizDoc = {
  _id: string;
  name: string;
  questions: QuestionRefDoc[];
  estimatedEffort: number;
  modifiedAt: Date;
  createdAt: Date;
};

export type QuestionOptionDoc = {
  id: string;
  description: string;
};

export type SingleChoiceQuestionDoc = {
  _id: string;
  description: string;
  options: QuestionOptionDoc[];
  correctOption: string;
  availableScore: number;
};

export type MultiChoiceQuestionDoc = {
  _id: string;
  description: string;
  options: QuestionOptionDoc[];
  correctOption: string[];
  availableScore: number;
};

export type QuestionResponseRefDoc = {
  questionCategory: QuestionCategories;
  questionResponseId: string;
};

export type QuizAttemptDoc = {
  quizId: string;
  studentId: string;
  response: QuestionResponseRefDoc[];
  createdAt: Date;
};

export type SingleChoiceQuestionResponseDoc = {
  _id: string;
  questionId: string;
  choice: string;
};

export type MultiChoiceQuestionResponseDoc = {
  _id: string;
  questionId: string;
  choice: string[];
};
