import { Router } from 'express';
import { protect } from '../middeware/authMiddleware.js';
import { uploadFile } from '../middeware/uploadMiddleware.js';
import {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  deleteAccount,
} from '../controllers/userController.js';

const router = Router();

router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/avatar', uploadFile, updateAvatar);
router.delete('/account', deleteAccount);

export default router;
