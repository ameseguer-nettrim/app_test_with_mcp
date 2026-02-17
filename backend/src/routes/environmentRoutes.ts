import { Router } from 'express';
import {
  getEnvironments,
  createEnvironment,
  getEnvironmentDetails,
  addPersonToEnvironment,
} from '../controllers/environmentController';
import { authMiddleware } from '../middleware/auth';
import { createInvitation } from '../controllers/invitationController';
import { createCategoryByEnvironment, listByEnvironment } from '../controllers/categoriesController';

const router = Router();

router.use(authMiddleware);

router.get('/', getEnvironments);
router.post('/', createEnvironment);
router.get('/:id', getEnvironmentDetails);
router.post('/:id/people', addPersonToEnvironment);
router.post('/:environment_id/invite', createInvitation);
router.get('/:id/categories', authMiddleware, listByEnvironment);
router.post('/:id/categories', authMiddleware, createCategoryByEnvironment);

export default router;
