import {Connection, Schema} from 'mongoose';
import {dateType} from './common';
import {FinishedCourseDoc} from './types';

const schema = new Schema<FinishedCourseDoc>({
  studentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  availableScore: Number,
  createdAt: dateType
});

export default (connection: Connection) =>
  connection.model<FinishedCourseDoc>('FinishedCourse', schema);
