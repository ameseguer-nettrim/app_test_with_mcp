import { Router } from 'express';
import {
  getEnvironments,
  createEnvironment,
  getEnvironmentDetails,
  addPersonToEnvironment,
} from '../controllers/environmentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getEnvironments);
router.post('/', createEnvironment);
router.get('/:id', getEnvironmentDetails);
router.post('/:id/people', addPersonToEnvironment);

export default router;