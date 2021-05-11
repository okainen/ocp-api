import {Types} from 'mongoose';

export default () => Types.ObjectId().toHexString();
