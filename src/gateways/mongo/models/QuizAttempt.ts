import {Connection, Schema} from 'mongoose';
import {dateType, idType, questionResponseRefSubschema} from './common';
import {QuizAttemptDoc} from './types';

const schema = new Schema<QuizAttemptDoc>({
  quizId: idType,
  studentId: idType,
  response: {type: [questionResponseRefSubschema], required: true},
  isFinal: {type: Boolean, required: true},
  modifiedAt: dateType,
  createdAt: dateType
});

export default (connection: Connection) =>
  connection.model<QuizAttemptDoc>('QuizAttempt', schema);
