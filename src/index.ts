import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {
  verifyUser,
  handleError,
  createDirIfNonexistent
} from './middleware';
import {
  userRouter,
  courseRouter,
  weekRouter,
  lectureRouter,
  // readingRouter,
  quizRouter,
  singleChoiceQuestionRouter,
  multiChoiceQuestionRouter,
  scheduledEventRouter,
  courseCategoryRouter
} from './routers';
import config from './config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser(config.app.signedCookie.secret));
app.use(verifyUser);

app.use('/api/users', userRouter);
app.use('/api/course-categories', courseCategoryRouter);
app.use('/api/courses', courseRouter);
app.use('/api/weeks', weekRouter);
app.use('/api/scheduled-events', scheduledEventRouter);
app.use('/api/lectures', lectureRouter);
// app.use('/api/readings', readingRouter);
app.use('/api/quizes', quizRouter);
app.use('/api/single-choice-questions', singleChoiceQuestionRouter);
app.use('/api/multi-choice-questions', multiChoiceQuestionRouter);
app.use('/static', createDirIfNonexistent('static'), express.static('static'));

app.use(handleError);

app.listen(config.app.port, () =>
  console.log(`Listening on port ${config.app.port}...`)
);
