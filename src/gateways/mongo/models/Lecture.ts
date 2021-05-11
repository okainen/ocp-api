import {Connection, Schema} from 'mongoose';
import {filepathType, stepSubschema} from './common';
import {LectureDoc} from './types';

const schema = new Schema<LectureDoc>({
  videoPath: filepathType,
  ...stepSubschema
});

export default (connection: Connection) =>
  connection.model<LectureDoc>('Lecture', schema);
