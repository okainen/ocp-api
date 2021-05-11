import {Connection, Schema} from 'mongoose';
import {idType, filepathType, dateType} from './common';
import {CourseDoc} from './types';

const schema = new Schema<CourseDoc>({
  authorId: idType,
  name: {type: String, required: true},
  description: {type: String, required: true},
  weekIds: {type: [idType], required: true},
  categoryIds: {type: [idType], required: true},
  imgPath: filepathType,
  isPublished: {type: Boolean},
  modifiedAt: dateType,
  createdAt: dateType
});

export default (connection: Connection) =>
  connection.model<CourseDoc>('Course', schema);
