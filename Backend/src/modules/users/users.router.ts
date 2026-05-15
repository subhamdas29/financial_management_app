import { Router } from 'express';
import { usersController } from './users.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.get('/search', usersController.searchByEmail);

export default router;