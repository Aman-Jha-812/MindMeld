import { Router } from 'express';
import { protect } from '../middeware/authMiddleware.js';
import { getInvitation, acceptInvitation } from '../controllers/invitationController.js';

const router = Router();

router.get('/:token', getInvitation);
router.post('/:token/accept', protect, acceptInvitation);

export default router;
