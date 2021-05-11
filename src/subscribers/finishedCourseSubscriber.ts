import {EventEmitter} from 'events';
import {
  COURSE_PROGRESS_RESET,
  QUIZ_ATTEMPT_SUBMITTED,
  STUDENT_UNENROLLED
} from '@/constants/events';
import {Course, FinishedCourse} from '@/entities';
import {
  IFinishedCourseGateway,
  IFinishedStepGateway,
  IQuizAttemptGateway,
  IQuizGateway,
  IWeekGateway
} from '../interfaces/gateways';
import {DataIntegrityError} from '@/errors';
import {FINISHED_COURSE_NOT_FOUND, WEEK_NOT_FOUND} from '@/constants/errors';
import {StepCategories} from '@/entities/enums';

export default (
  finishedCourseGateway: IFinishedCourseGateway,
  weekGateway: IWeekGateway,
  quizGateway: IQuizGateway,
  quizAttemptGateway: IQuizAttemptGateway,
  finishedStepGateway: IFinishedStepGateway,
  emitter: EventEmitter
) => {
  emitter.on(
    QUIZ_ATTEMPT_SUBMITTED,
    async ({
      studentId,
      course
    }: {
      studentId: string;
      course: Course;
      stepId: string;
    }) => {
      const finalQuizAttemts = (
        await Promise.all(
          course.weekIds.map(async weekId => {
            const week = await weekGateway.get(weekId);
            if (!week) {
              throw new DataIntegrityError(WEEK_NOT_FOUND);
            }
            return await Promise.all(
              week.steps
                .filter(
                  ({stepCategory}) => stepCategory === StepCategories.QUIZ
                )
                .map(async step => {
                  const finishedStep = await finishedStepGateway.get(
                    studentId,
                    step
                  );
                  if (!finishedStep) {
                    throw new Error();
                  }
                  const quizAttempt = await quizAttemptGateway.get(
                    studentId,
                    step.stepId
                  );
                  if (!quizAttempt) {
                    throw new Error();
                  }
                  return quizAttempt;
                })
            );
          })
        )
      ).flat();
      const quizes = (
        await Promise.all(
          course.weekIds.map(async weekId => {
            const week = await weekGateway.get(weekId);
            if (!week) {
              throw new DataIntegrityError(WEEK_NOT_FOUND);
            }
            return await Promise.all(
              week.steps
                .filter(
                  ({stepCategory}) => stepCategory === StepCategories.QUIZ
                )
                .map(async ({stepId}) => {
                  const quiz = await quizGateway.get(stepId);
                  if (!quiz) {
                    throw new Error();
                  }
                  return quiz;
                })
            );
          })
        )
      ).flat();
      const availableScore = quizes.reduce((acc, curr) => {
        return acc + curr.availableScore;
      }, 0);
      const score = finalQuizAttemts.reduce((acc, curr) => {
        return acc + curr.score;
      }, 0);
      const finishedCourse = new FinishedCourse({
        studentId,
        courseId: course.id!,
        score: score / (availableScore + score)
      });
      await finishedCourseGateway.create(finishedCourse);
    }
  );

  const deleteEntity = async (studentId: string, courseId: string) => {
    const finishedCourse = await finishedCourseGateway.delete(
      studentId,
      courseId
    );
    if (!finishedCourse) {
      throw new DataIntegrityError(FINISHED_COURSE_NOT_FOUND);
    }

    await finishedCourseGateway.delete(studentId, courseId);
  };

  emitter.on(
    STUDENT_UNENROLLED,
    async ({studentId, course}: {studentId: string; course: Course}) => {
      await deleteEntity(studentId, course.id!);
    }
  );

  emitter.on(
    COURSE_PROGRESS_RESET,
    async ({studentId, course}: {studentId: string; course: Course}) => {
      await deleteEntity(studentId, course.id!);
    }
  );
};
