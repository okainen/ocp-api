import express from 'express';
import {scheduledEventController} from '../di';

const router = express.Router();
router.post('/', scheduledEventController.create);
router.get('/:id', scheduledEventController.get);
router.get('/', scheduledEventController.getAll);
router.patch('/:id', scheduledEventController.update);
router.delete('/:id', scheduledEventController.delete);

export default router;
