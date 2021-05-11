import express from 'express';
import {singleChoiceQuestionController} from '../di';

const router = express.Router();
router.post('/', singleChoiceQuestionController.create);
router.patch('/:id', singleChoiceQuestionController.update);
router.delete('/:id', singleChoiceQuestionController.delete);

export default router;
