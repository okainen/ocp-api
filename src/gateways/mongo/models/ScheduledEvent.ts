import {Connection, Schema} from 'mongoose';
import {dateType} from './common';
import {ScheduledEventDoc} from './types';
import {StepCategories} from '@/entities/enums';

const schema = new Schema<ScheduledEventDoc>({
  studentId: {type: String, required: true},
  stepRef: {
    stepCategory: {
      type: String,
      enum: [
        StepCategories.LECTURE,
        StepCategories.READING,
        StepCategories.QUIZ
      ],
      required: true
    },
    stepId: {type: Schema.Types.ObjectId, required: true}
  },
  timespamp: {
    beginning: dateType,
    end: dateType
  }
});

export default (connection: Connection) =>
  connection.model<ScheduledEventDoc>('ScheduledEvent', schema);
