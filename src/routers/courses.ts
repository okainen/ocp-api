import express from 'express';
import {courseController} from '../di';
import config from '@/config';
import {createDirIfNonexistent, uploadSingleFile} from '../middleware';

const {
  app: {
    courses: {imgDir}
  }
} = config;

const router = express.Router();
router.post('/', courseController.create);
router.get('/', courseController.getAll);
router.get('/:id', courseController.get);
router.patch('/:id', courseController.update);
router.post(
  '/:id/img',
  createDirIfNonexistent(imgDir),
  uploadSingleFile(imgDir, new Set(['image/png', 'image/jpeg']), 'img'),
  courseController.uploadImg
);
router.delete('/:id', courseController.delete);
router.post('/:id/enrollment', courseController.enroll);
router.delete('/:id/enrollment', courseController.unenroll);

export default router;
