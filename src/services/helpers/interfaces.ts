import {UserRoles} from '@/entities/enums';
import {CurrentUser, QuestionRef, StepRef} from '@/entities/valueObjects';
import {Course, Quiz, Week} from '@/entities';

export interface HashingHelper {
  hash: (s: string) => Promise<string>;
  compare: (
    hashedStringWithSalt: string,
    suppliedString: string
  ) => Promise<boolean>;
}

export interface authorizeUser {
  (currentUser: CurrentUser | null, permitted?: UserRoles | UserRoles[]): void;
}

export interface validateId {
  (id: string): boolean;
}

export interface getQuiz {
  (id: string): Promise<Quiz>;
}

export interface getFieldsQuery {
  (queryParams: any): string[] | null;
}

export interface getStepLineage {
  (stepRef: StepRef): Promise<{
    course: Course;
    week: Week;
  }>;
}

export interface getQuestionLineage {
  (questionRef: QuestionRef): Promise<{
    course: Course;
    week: Week;
    quiz: Quiz;
  }>;
}
