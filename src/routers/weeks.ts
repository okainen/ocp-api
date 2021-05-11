import express from 'express';
import {weekController} from '../di';

const router = express.Router();
router.post('/', weekController.create);
router.get('/:id', weekController.get);
// router.get('/:id/grades', weekController.getGradedSteps);
router.patch('/:id', weekController.update);
router.delete('/:id', weekController.delete);

export default router;
