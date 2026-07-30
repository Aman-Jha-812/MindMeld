import { Router } from 'express';
import { protect } from '../middeware/authMiddleware.js';
import {
  chatSummary,
  generateCode,
  debugCode,
  explainCode,
  meetingNotes,
  documentation,
  commitMessage,
  technicalQuestion,
  actionItems,
  suggestTasks,
  codeReview,
  getHistory,
} from '../controllers/aiController.js';

const router = Router();

router.use(protect);

router.post('/chat-summary', chatSummary);
router.post('/generate-code', generateCode);
router.post('/debug-code', debugCode);
router.post('/explain-code', explainCode);
router.post('/meeting-notes', meetingNotes);
router.post('/documentation', documentation);
router.post('/commit-message', commitMessage);
router.post('/technical-question', technicalQuestion);
router.post('/action-items', actionItems);
router.post('/suggest-tasks', suggestTasks);
router.post('/code-review', codeReview);
router.get('/history', getHistory);

export default router;
