import {EventEmitter} from 'events';
import {
  LECTURE_DELETED,
  LECTURE_REQUESTED,
  QUIZ_ATTEMPT_SUBMITTED,
  QUIZ_DELETED,
  READING_DELETED,
  READING_REQUESTED
} from '@/constants/events';
import {IFinishedStepGateway} from '../interfaces/gateways';
import {Course, FinishedStep, Lecture, Quiz, Reading} from '@/entities';
import {StepRef} from '@/entities/valueObjects';
import {StepCategories} from '@/entities/enums';

export default (
  finishedStepGateway: IFinishedStepGateway,
  emitter: EventEmitter
) => {
  emitter.on(
    LECTURE_DELETED,
    async ({studentId, lecture}: {studentId: string; lecture: Lecture}) => {
      const stepRef = new StepRef(lecture.id!, StepCategories.LECTURE);
      await finishedStepGateway.delete(studentId, stepRef);
    }
  );

  emitter.on(
    READING_DELETED,
    async ({studentId, reading}: {studentId: string; reading: Reading}) => {
      const stepRef = new StepRef(reading.id!, StepCategories.READING);
      await finishedStepGateway.delete(studentId, stepRef);
    }
  );

  emitter.on(
    QUIZ_DELETED,
    async ({studentId, quiz}: {studentId: string; quiz: Quiz}) => {
      const stepRef = new StepRef(quiz.id!, StepCategories.QUIZ);
      await finishedStepGateway.delete(studentId, stepRef);
    }
  );

  emitter.on(
    LECTURE_REQUESTED,
    async ({studentId, id}: {studentId: string; id: string}) => {
      const stepRef = new StepRef(id, StepCategories.LECTURE);
      const finishedStep = new FinishedStep({studentId, stepRef});
      await finishedStepGateway.create(finishedStep);
    }
  );

  emitter.on(
    READING_REQUESTED,
    async ({studentId, id}: {studentId: string; id: string}) => {
      const stepRef = new StepRef(id, StepCategories.READING);
      const finishedStep = new FinishedStep({studentId, stepRef});
      await finishedStepGateway.create(finishedStep);
    }
  );

  emitter.on(
    QUIZ_ATTEMPT_SUBMITTED,
    async ({
      studentId,
      stepId
    }: {
      studentId: string;
      course: Course;
      stepId: string;
    }) => {
      const stepRef = new StepRef(stepId, StepCategories.QUIZ);
      const finishedStep = new FinishedStep({studentId, stepRef});
      await finishedStepGateway.create(finishedStep);
    }
  );
};
