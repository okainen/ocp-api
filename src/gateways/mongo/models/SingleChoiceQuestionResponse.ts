import {Connection, Schema} from 'mongoose';
import {SingleChoiceQuestionResponseDoc} from './types';
import {idType} from './common';

const schema = new Schema<SingleChoiceQuestionResponseDoc>({
  questionId: idType,
  choice: {type: String, required: true}
});

export default (connection: Connection) =>
  connection.model<SingleChoiceQuestionResponseDoc>(
    'SingleChoiceQuestionResponse',
    schema
  );
