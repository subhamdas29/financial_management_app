import { Router } from "express";
import { foldersController } from './folders.controller';
import { validate } from '../../middleware/validate.middleware';
import { createFolderSchema, updateFolderSchema } from './folders.schema';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/summary', foldersController.getAllSummary);
router.get('/', foldersController.getAll);
router.get('/:id', foldersController.getById);
router.get('/:id/summary', foldersController.getSummary);
router.post('/', validate(createFolderSchema), foldersController.create);
router.patch('/:id', validate(updateFolderSchema), foldersController.update);
router.delete('/:id', foldersController.delete);

export default router;