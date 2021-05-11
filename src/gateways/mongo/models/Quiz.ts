import {Connection, Schema} from 'mongoose';
import {questionRefSubschema, stepSubschema} from './common';
import {QuizDoc} from './types';

const schema = new Schema<QuizDoc>({
  ...stepSubschema,
  questions: [questionRefSubschema]
});

export default (connection: Connection) =>
  connection.model<QuizDoc>('Quiz', schema);
