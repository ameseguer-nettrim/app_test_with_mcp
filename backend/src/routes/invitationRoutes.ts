import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { acceptInvitation, getInvitationDetails } from '../controllers/invitationController';

const router = Router();

router.use(authMiddleware);

router.get('/:token', getInvitationDetails);
router.post('/:token/accept', acceptInvitation);

export default router;
