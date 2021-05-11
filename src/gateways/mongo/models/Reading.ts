import {Connection, Schema} from 'mongoose';
import {filepathType, stepSubschema} from './common';
import {ReadingDoc} from './types';

const schema = new Schema<ReadingDoc>({
  docPath: filepathType,
  ...stepSubschema
});

export default (connection: Connection) =>
  connection.model<ReadingDoc>('Reading', schema);
