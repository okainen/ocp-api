import {Connection, Schema} from 'mongoose';
import {dateType, stepRefSubschema} from './common';
import {WeekDoc} from './types';

const schema = new Schema<WeekDoc>({
  name: {type: String, required: true},
  description: {type: String, required: true},
  steps: [stepRefSubschema],
  modifiedAt: dateType,
  createdAt: dateType
});

export default (connection: Connection) =>
  connection.model<WeekDoc>('Week', schema);
