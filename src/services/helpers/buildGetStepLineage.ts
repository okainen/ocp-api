import {StepRef} from '@/entities/valueObjects';
import {DataIntegrityError} from '@/errors';
import {ICourseGateway, IWeekGateway} from '@/interfaces/gateways';
import {COURSE_NOT_FOUND, WEEK_NOT_FOUND} from '@/constants/errors';

export default (courseGateway: ICourseGateway, weekGateway: IWeekGateway) => {
  return async (stepRef: StepRef) => {
    // get parent week
    const week = await weekGateway.getByStepRef(stepRef);
    if (!week) {
      throw new DataIntegrityError(WEEK_NOT_FOUND);
    }

    // get parent course
    const course = await courseGateway.getByWeekId(week.id!);
    if (!course) {
      throw new DataIntegrityError(COURSE_NOT_FOUND);
    }

    return {course, week};
  };
};
