import {Connection, Schema} from 'mongoose';
import {MultiChoiceQuestionResponseDoc} from './types';
import {idType} from './common';

const schema = new Schema<MultiChoiceQuestionResponseDoc>({
  questionId: idType,
  choice: {type: [String], required: true}
});

export default (connection: Connection) =>
  connection.model<MultiChoiceQuestionResponseDoc>(
    'MultiChoiceQuestionResponse',
    schema
  );
