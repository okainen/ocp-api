import {Connection, Schema} from 'mongoose';
import {dateType} from './common';
import {CourseCategoryDoc} from './types';

const schema = new Schema<CourseCategoryDoc>({
  name: {type: String, unique: true, required: true},
  modifiedAt: dateType,
  createdAt: dateType
});

export default (connection: Connection) =>
  connection.model<CourseCategoryDoc>('CourseCategory', schema);
