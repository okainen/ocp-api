import mongoose from 'mongoose';
import config from '@/config';

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}

// mongoose.connect(config.db.mongo.url, {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false
// });

export default mongoose.createConnection(config.db.mongo.url, options);
