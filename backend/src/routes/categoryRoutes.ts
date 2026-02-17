import { Router } from 'express';
import * as categoriesController from '../controllers/categoriesController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Update & Delete by category id
router.put('/:id', authMiddleware, categoriesController.update);
router.delete('/:id', authMiddleware, categoriesController.remove);

export default router;
