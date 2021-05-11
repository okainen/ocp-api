import {Schema} from 'mongoose';
import {StepCategories, QuestionCategories} from '@/entities/enums';
import {
  QuestionOptionDoc,
  QuestionRefDoc,
  QuestionResponseRefDoc,
  StepRefDoc
} from './types';

export const dateType = {type: Date, required: true};
export const idType = {type: Schema.Types.ObjectId, required: true};
export const filepathType = {type: String, default: null};

export const stepRefSubschema = new Schema<StepRefDoc>({
  _id: false,
  stepCategory: {
    type: String,
    enum: [StepCategories.LECTURE, StepCategories.READING, StepCategories.QUIZ],
    required: true
  },
  stepId: idType
});

export const stepSubschema = {
  name: {type: String, required: true},
  estimatedEffort: {type: Number, required: true},
  modifiedAt: dateType,
  createdAt: dateType
};

export const questionRefSubschema = new Schema<QuestionRefDoc>({
  _id: false,
  questionCategory: {
    type: String,
    enum: [QuestionCategories.SINGLE_CHOICE, QuestionCategories.MULTI_CHOICE],
    required: true
  },
  questionId: idType
});

export const questionSubschema = {
  description: {type: String, required: true},
  availableScore: {type: Number, required: true}
};

export const optionSubschema = new Schema<QuestionOptionDoc>({
  _id: false,
  id: {type: Schema.Types.ObjectId, required: true},
  description: {type: String, required: true}
});

export const questionResponseRefSubschema = new Schema<QuestionResponseRefDoc>({
  _id: false,
  questionCategory: {
    type: String,
    enum: [QuestionCategories.SINGLE_CHOICE, QuestionCategories.MULTI_CHOICE],
    required: true
  },
  questionResponseId: idType
});
