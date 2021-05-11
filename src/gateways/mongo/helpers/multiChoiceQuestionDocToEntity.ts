import {MultiChoiceQuestion} from '@/entities';
import {QuestionOption} from '@/entities/valueObjects';
import {MultiChoiceQuestionDoc} from '../models/types';

export default (entityDoc: MultiChoiceQuestionDoc) => {
  const {
    _id: id,
    description,
    options,
    correctOption,
    availableScore
  } = entityDoc;
  return new MultiChoiceQuestion({
    id,
    description,
    options: options.map(
      ({id, description}) => new QuestionOption(id, description)
    ),
    correctOption,
    availableScore
  });
};
