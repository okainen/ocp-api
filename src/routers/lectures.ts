import express from 'express';
import {lectureController} from '../di';
import config from '@/config';
import {createDirIfNonexistent, uploadSingleFile} from '../middleware';

const {
  app: {
    lectures: {videoDir}
  }
} = config;

const router = express.Router();
router.post('/', lectureController.create);
router.get('/:id', lectureController.get);
router.get('/:id/video/stream', lectureController.getVideoStream);
router.patch('/:id', lectureController.update);
router.post(
  '/:id/video',
  createDirIfNonexistent(videoDir),
  uploadSingleFile(
    videoDir,
    new Set(['video/mp4', 'video/mpeg', 'video/webm']),
    'video'
  ),
  lectureController.uploadVideo
);
router.delete('/:id', lectureController.delete);

export default router;
