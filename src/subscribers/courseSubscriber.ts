import {EventEmitter} from 'events';
import {
  COURSE_PROGRESS_RESET,
  STUDENT_UNENROLLED,
  WEEK_CREATED,
  WEEK_DELETED,
  WEEK_UPDATED
} from '@/constants/events';
import {Course, Week} from '@/entities';
import {
  ICourseGateway,
  IFinishedStepGateway,
  IQuizAttemptGateway,
  IWeekGateway
} from '../interfaces/gateways';
import {DataIntegrityError} from '@/errors';
import {WEEK_NOT_FOUND} from '@/constants/errors';
import {StepCategories} from '@/entities/enums';

export default (
  courseGateway: ICourseGateway,
  weekGateway: IWeekGateway,
  finishedStepGateway: IFinishedStepGateway,
  quizAttemptGateway: IQuizAttemptGateway,
  emitter: EventEmitter
) => {
  const resetProgress = (studentId: string, course: Course) => {
    course.weekIds.forEach(async weekId => {
      const week = await weekGateway.get(weekId);
      if (!week) {
        throw new DataIntegrityError(WEEK_NOT_FOUND);
      }

      week.steps
        .filter(async step => {
          return step.stepCategory === StepCategories.QUIZ;
        })
        .forEach(async step => {
          await quizAttemptGateway.delete(studentId, step.stepId);
        });

      week.steps.forEach(async step => {
        await finishedStepGateway.delete(studentId, step);
      });
    });
  };

  emitter.on(
    STUDENT_UNENROLLED,
    async ({studentId, course}: {studentId: string; course: Course}) => {
      resetProgress(studentId, course);
    }
  );

  emitter.on(
    COURSE_PROGRESS_RESET,
    async ({studentId, course}: {studentId: string; course: Course}) => {
      resetProgress(studentId, course);
    }
  );

  const insertWeekId = async (
    course: Course,
    weekId: string,
    seqNum?: number
  ) => {
    const newWeekIdArr = [...course.weekIds.filter(item => item !== weekId)];
    newWeekIdArr.splice(
      seqNum === undefined ? newWeekIdArr.length : seqNum,
      0,
      weekId
    );
    await courseGateway.update(
      course.update({
        weekIds: newWeekIdArr
      })
    );
  };

  emitter.on(
    WEEK_CREATED,
    async ({
      course,
      week,
      seqNum
    }: {
      course: Course;
      week: Week;
      seqNum?: number;
    }) => {
      await insertWeekId(course, week.id!, seqNum);
    }
  );

  emitter.on(
    WEEK_UPDATED,
    async ({
      course,
      week,
      seqNum
    }: {
      course: Course;
      week: Week;
      seqNum?: number;
    }) => {
      await insertWeekId(course, week.id!, seqNum);
    }
  );

  emitter.on(
    WEEK_DELETED,
    async ({course, week}: {course: Course; week: Week}) => {
      await courseGateway.update(
        course.update({
          weekIds: course.weekIds.filter(item => item !== week.id!)
        })
      );
    }
  );
};
