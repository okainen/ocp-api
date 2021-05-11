import {EventEmitter} from 'events';
import {
  COURSE_DELETED,
  STEP_CREATED,
  STEP_DELETED,
  STEP_UPDATED,
  WEEK_DELETED
} from '@/constants/events';
import {Course, Week} from '@/entities';
import {DataIntegrityError} from '@/errors';
import {IWeekGateway} from '../interfaces/gateways';
import {WEEK_NOT_FOUND} from '@/constants/errors';
import {StepRef} from '@/entities/valueObjects';

export default (weekGateway: IWeekGateway, emitter: EventEmitter) => {
  emitter.on(COURSE_DELETED, async (course: Course) => {
    course.weekIds.forEach(async (weekId: string) => {
      const week = await weekGateway.delete(weekId);
      if (!week) {
        throw new DataIntegrityError(WEEK_NOT_FOUND);
      }

      emitter.emit(WEEK_DELETED, week);
    });
  });

  const insertStepRef = async (
    week: Week,
    stepRef: StepRef,
    seqNum?: number
  ) => {
    const newStepRefArr = [
      ...week.steps.filter(item => !item.isEqual(stepRef))
    ];
    newStepRefArr.splice(
      seqNum === undefined ? newStepRefArr.length : seqNum,
      0,
      stepRef
    );
    await weekGateway.update(
      week.update({
        steps: newStepRefArr
      })
    );
  };

  emitter.on(
    STEP_CREATED,
    async ({
      week,
      stepRef,
      seqNum
    }: {
      week: Week;
      stepRef: StepRef;
      seqNum?: number;
    }) => {
      await insertStepRef(week, stepRef, seqNum);
    }
  );

  emitter.on(
    STEP_UPDATED,
    async ({
      week,
      stepRef,
      seqNum
    }: {
      week: Week;
      stepRef: StepRef;
      seqNum?: number;
    }) => {
      await insertStepRef(week, stepRef, seqNum);
    }
  );

  emitter.on(
    STEP_DELETED,
    async ({week, stepRef}: {week: Week; stepRef: StepRef}) => {
      await weekGateway.update(
        week.update({
          steps: week.steps.filter(item => !item.isEqual(stepRef))
        })
      );
    }
  );
};
