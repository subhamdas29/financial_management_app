import { Router } from 'express';
import { transfersController } from './transfers.controller';
import { validate } from '../../middleware/validate.middleware';
import { createTransferSchema, getTransfersSchema } from './transfers.schema';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/stats', transfersController.getStats);
router.get('/', validate(getTransfersSchema), transfersController.getAll);
router.get('/:id', transfersController.getById);
router.post('/', validate(createTransferSchema), transfersController.create);

export default router;