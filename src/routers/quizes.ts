import express from 'express';
import {quizController, quizAttemptController} from '../di';

const router = express.Router();
router.post('/', quizController.create);
router.get('/:id', quizController.get);
router.patch('/:id', quizController.update);
router.delete('/:id', quizController.delete);
router.get('/:quizId/attempt', quizAttemptController.get);
router.post('/:quizId/attempt/submit', quizAttemptController.submit);
router.post('/:quizId/attempt/save', quizAttemptController.save);

export default router;
