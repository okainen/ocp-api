import {SingleChoiceQuestion} from '@/entities';
import {QuestionOption} from '@/entities/valueObjects';
import {SingleChoiceQuestionDoc} from '../models/types';

export default (entityDoc: SingleChoiceQuestionDoc) => {
  const {
    _id: id,
    description,
    options,
    correctOption,
    availableScore
  } = entityDoc;
  return new SingleChoiceQuestion({
    id,
    description,
    options: options.map(
      ({id, description}) => new QuestionOption(id, description)
    ),
    correctOption,
    availableScore
  });
};
