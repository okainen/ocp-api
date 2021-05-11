import express from 'express';
import {courseCategoryController} from '../di';

const router = express.Router();
router.post('/', courseCategoryController.create);
router.get('/:id', courseCategoryController.get);

export default router;
