import express from 'express';
import {multiChoiceQuestionController} from '../di';

const router = express.Router();
router.post('/', multiChoiceQuestionController.create);
router.patch('/:id', multiChoiceQuestionController.update);
router.delete('/:id', multiChoiceQuestionController.delete);

export default router;
