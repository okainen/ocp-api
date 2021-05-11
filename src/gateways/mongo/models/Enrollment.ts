import {Connection, Schema} from 'mongoose';
import {dateType} from './common';
import {EnrollmentDoc} from './types';

const schema = new Schema<EnrollmentDoc>({
  studentId: {type: String, required: true},
  courseId: {type: String, required: true},
  createdAt: dateType
});

export default (connection: Connection) =>
  connection.model<EnrollmentDoc>('Enrollment', schema);
