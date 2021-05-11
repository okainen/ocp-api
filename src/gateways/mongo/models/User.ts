import {Connection, Schema} from 'mongoose';
import {UserRoles} from '@/entities/enums';
import {filepathType, dateType} from './common';
import {UserDoc} from './types';

const schema = new Schema<UserDoc>({
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  username: {type: String, unique: true, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String},
  role: {
    type: String,
    enum: [UserRoles.ADMIN, UserRoles.AUTHOR, UserRoles.STUDENT],
    required: true
  },
  imgPath: filepathType,
  isActive: {type: Boolean},
  modifiedAt: dateType,
  createdAt: dateType
});

export default (connection: Connection) =>
  connection.model<UserDoc>('User', schema);
