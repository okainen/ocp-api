import {Types} from 'mongoose';

export default (id: string) => Types.ObjectId.isValid(id);
