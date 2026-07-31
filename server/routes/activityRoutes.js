import { Router } from 'express';
import { protect } from '../middeware/authMiddleware.js';
import { getRecentActivity } from '../controllers/activityController.js';

const router = Router();

router.use(protect);

router.get('/recent', getRecentActivity);

export default router;
