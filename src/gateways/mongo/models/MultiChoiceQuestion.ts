import {Connection, Schema} from 'mongoose';
import {optionSubschema, questionSubschema} from './common';
import {MultiChoiceQuestionDoc} from './types';

const schema = new Schema<MultiChoiceQuestionDoc>({
  ...questionSubschema,
  options: [optionSubschema],
  correctOption: {type: [Schema.Types.ObjectId], required: true}
});

export default (connection: Connection) =>
  connection.model<MultiChoiceQuestionDoc>('MultiChoiceQuestion', schema);
