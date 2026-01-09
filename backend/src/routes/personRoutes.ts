import { Router } from 'express';
import { getPeople, getPeopleInEnvironment } from '../controllers/personController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getPeople);
router.get('/environment', getPeopleInEnvironment);

export default router;