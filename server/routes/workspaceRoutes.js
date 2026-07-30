import { Router } from 'express';
import { protect, authorize } from '../middeware/authMiddleware.js';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  leaveWorkspace,
  updateMemberRole,
  getMembers,
} from '../controllers/workspaceController.js';

const router = Router();

router.use(protect);

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.put('/:id', authorize('admin'), updateWorkspace);
router.delete('/:id', authorize('admin'), deleteWorkspace);
router.post('/:id/invite', authorize('admin'), inviteMember);
router.delete('/:id/members/:memberId', authorize('admin'), removeMember);
router.post('/:id/leave', leaveWorkspace);
router.put('/:id/members/:memberId/role', authorize('admin'), updateMemberRole);
router.get('/:id/members', getMembers);

export default router;
