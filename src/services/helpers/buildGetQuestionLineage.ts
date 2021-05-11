import {QuestionRef, StepRef} from '@/entities/valueObjects';
import {DataIntegrityError} from '@/errors';
import {IQuizGateway} from '@/interfaces/gateways';
import {QUIZ_NOT_FOUND} from '@/constants/errors';
import {StepCategories} from '@/entities/enums';
import {Course, Week} from '@/entities';

export default (
  getStepLineage: (stepRef: StepRef) => Promise<{
    course: Course;
    week: Week;
  }>,
  quizGateway: IQuizGateway
) => {
  return async (questionRef: QuestionRef) => {
    // get parent quiz
    const quiz = await quizGateway.getByQuestionRef(questionRef);
    if (!quiz) {
      throw new DataIntegrityError(QUIZ_NOT_FOUND);
    }

    const stepRef = new StepRef(quiz.id!, StepCategories.QUIZ);
    const {course, week} = await getStepLineage(stepRef);

    return {course, week, quiz};
  };
};
