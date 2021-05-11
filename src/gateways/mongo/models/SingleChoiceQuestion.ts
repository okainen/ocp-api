import {Connection, Schema} from 'mongoose';
import {optionSubschema, questionSubschema} from './common';
import {SingleChoiceQuestionDoc} from './types';

const schema = new Schema<SingleChoiceQuestionDoc>({
  ...questionSubschema,
  options: [optionSubschema],
  correctOption: {type: Schema.Types.ObjectId, required: true}
});

export default (connection: Connection) =>
  connection.model<SingleChoiceQuestionDoc>('SingleChoiceQuestion', schema);
