import {
  MultiChoiceQuestion,
  Question,
  Quiz,
  SingleChoiceQuestion
} from '@/entities';
import {
  MultiChoiceQuestionDoc,
  QuestionRefDoc,
  QuizDoc,
  SingleChoiceQuestionDoc
} from '../models/types';

export interface singleChoiceQuestionDocToEntity {
  (singleChoiceQuestionDoc: SingleChoiceQuestionDoc): SingleChoiceQuestion;
}

export interface multiChoiceQuestionDocToEntity {
  (multiChoiceQuestionDoc: MultiChoiceQuestionDoc): MultiChoiceQuestion;
}

export interface populateQuestions {
  (questionRefDocs: QuestionRefDoc[]): Promise<Question[]>;
}

export interface quizDocToEntity {
  (quizDoc: QuizDoc): Promise<Quiz>;
}

export interface getQuiz {
  (id: string): Promise<Quiz | null>;
}
