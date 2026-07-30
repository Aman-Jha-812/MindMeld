import { Router } from 'express';
import { protect } from '../middeware/authMiddleware.js';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} from '../controllers/chatController.js';

const router = Router();

router.use(protect);

router.get('/workspaces/:workspaceId/channels/:channelId/messages', getMessages);
router.post('/workspaces/:workspaceId/channels/:channelId/messages', sendMessage);
router.put('/messages/:id', editMessage);
router.delete('/messages/:id', deleteMessage);
router.get('/workspaces/:workspaceId/channels', getChannels);
router.post('/workspaces/:workspaceId/channels', createChannel);
router.put('/workspaces/:workspaceId/channels/:channelId', updateChannel);
router.delete('/workspaces/:workspaceId/channels/:channelId', deleteChannel);

export default router;
