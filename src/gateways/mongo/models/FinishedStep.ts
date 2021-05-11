import {Connection, Schema} from 'mongoose';
import {idType, dateType, stepRefSubschema} from './common';
import {FinishedStepDoc} from './types';

const schema = new Schema<FinishedStepDoc>(
  {
    studentId: idType,
    stepRef: stepRefSubschema,
    createdAt: dateType
  },
  {_id: false}
);

export default (connection: Connection) =>
  connection.model<FinishedStepDoc>('FinishedStep', schema);
