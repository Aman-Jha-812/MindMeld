import { Router } from 'express';
import { protect } from '../middeware/authMiddleware.js';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/taskController.js';

const router = Router();

router.use(protect);

router.put('/reorder', reorderTasks);
router.get('/workspaces/:workspaceId/tasks', getTasks);
router.post('/workspaces/:workspaceId/tasks', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
