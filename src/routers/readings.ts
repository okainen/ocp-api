import express from 'express';
import {readingController} from '../di';
import config from '@/config';
import {createDirIfNonexistent, uploadSingleFile} from '../middleware';

const {
  app: {
    readings: {docDir}
  }
} = config;

const router = express.Router();
router.post('/', readingController.create);
router.get('/:id', readingController.get);
router.patch('/:id', readingController.update);
router.post(
  '/:id/doc',
  createDirIfNonexistent(docDir),
  uploadSingleFile(docDir, new Set(['text/html']), 'doc'),
  readingController.uploadDoc
);
router.delete('/:id', readingController.delete);

export default router;
