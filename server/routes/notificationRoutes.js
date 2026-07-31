import { Router } from 'express';
import { protect } from '../middeware/authMiddleware.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markChannelAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-channel/:channelId', markChannelAsRead);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
