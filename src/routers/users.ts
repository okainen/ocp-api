import express from 'express';
import {userController} from '../di';
import {createDirIfNonexistent, uploadSingleFile} from '../middleware';
import config from '@/config';

const {
  app: {
    users: {imgDir}
  }
} = config;

const router = express.Router();
router.post('/', userController.signUp);
router.get('/activate/:token', userController.activate);
router.put('/reset-password', userController.resetPassword);
router.put('/reset-forgotten-password', userController.resetForgottenPassword);
router.get(
  '/reset-forgotten-password/:token',
  userController.verifyForgottenPasswordReset
);
router.put('/reset-email', userController.resetEmail);
router.get('/reset-email/:token', userController.verifyEmailReset);
router.post('/sign-in', userController.signIn);
router.get('/refresh-token', userController.useRefreshToken);
router.get('/current', userController.getCurrent);
router.get('/sign-out', userController.signOut);
router.get('/:id', userController.get);
router.patch('/:id', userController.update);
router.post(
  '/img',
  createDirIfNonexistent(imgDir),
  uploadSingleFile(imgDir, new Set(['image/png', 'image/jpeg']), 'img'),
  userController.uploadImg
);

export default router;
