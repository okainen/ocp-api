import {EventEmitter} from 'events';
import {
  LECTURE_NOT_FOUND,
  QUIZ_NOT_FOUND,
  READING_NOT_FOUND,
  STEP_UNKNOWN_CAT_FOUND
} from '@/constants/errors';
import {
  WEEK_DELETED,
  LECTURE_DELETED,
  READING_DELETED,
  QUIZ_DELETED
} from '@/constants/events';
import {Week} from '@/entities';
import {StepCategories} from '@/entities/enums';
import {DataIntegrityError} from '@/errors';
import {StepRef} from '@/entities/valueObjects';
import {
  ILectureGateway,
  IQuizGateway,
  IReadingGateway
} from '../interfaces/gateways';

export default (
  lectureGateway: ILectureGateway,
  readingGateway: IReadingGateway,
  quizGateway: IQuizGateway,
  emitter: EventEmitter
) => {
  emitter.on(WEEK_DELETED, async (week: Week) => {
    week.steps.forEach(async ({stepCategory, stepId}: StepRef) => {
      switch (stepCategory) {
        case StepCategories.LECTURE: {
          const lecture = await lectureGateway.delete(stepId);
          if (!lecture) {
            throw new DataIntegrityError(LECTURE_NOT_FOUND);
          }

          emitter.emit(LECTURE_DELETED, lecture);
        }
        case StepCategories.READING: {
          const reading = await readingGateway.delete(stepId);
          if (!reading) {
            throw new DataIntegrityError(READING_NOT_FOUND);
          }

          emitter.emit(READING_DELETED, reading);
        }
        case StepCategories.QUIZ: {
          const quiz = await quizGateway.delete(stepId);
          if (!quiz) {
            throw new DataIntegrityError(QUIZ_NOT_FOUND);
          }

          emitter.emit(QUIZ_DELETED, quiz);
        }
        default: {
          throw new DataIntegrityError(STEP_UNKNOWN_CAT_FOUND);
        }
      }
    });
  });
};
