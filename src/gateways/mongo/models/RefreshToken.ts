import {Connection, Schema} from 'mongoose';
import {dateType} from './common';
import {RefreshTokenDoc} from './types';

const schema = new Schema<RefreshTokenDoc>({
  userId: {type: String, required: true},
  ttl: {type: Number, required: true},
  createdAt: dateType
});

export default (connection: Connection) =>
  connection.model<RefreshTokenDoc>('RefreshToken', schema);
