import { Router } from "express";
import { transactionsController } from "./transactions.controller";
import { validate } from '../../middleware/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsSchema,
} from './transactions.schema';
import { protect } from '../../middleware/auth.middleware';


const router = Router();

router.use(protect);

router.get('/stats', transactionsController.getStats);
router.get('/', validate(getTransactionsSchema), transactionsController.getAll);
router.get('/:id', transactionsController.getById);
router.post('/', validate(createTransactionSchema), transactionsController.create);
router.patch('/:id', validate(updateTransactionSchema), transactionsController.update);

export default router;