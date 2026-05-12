import { Router } from "express";
import { accountsController } from './accounts.controller';
import { validate } from '../../middleware/validate.middleware';
import { createAccountSchema, updateAccountSchema } from './accounts.schema';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/summary', accountsController.getSummary);
router.get('/', accountsController.getAll);
router.get('/:id', accountsController.getById);
router.post('/', validate(createAccountSchema), accountsController.create);
router.patch('/:id', validate(updateAccountSchema), accountsController.update);
router.delete('/:id', accountsController.delete);

export default router;