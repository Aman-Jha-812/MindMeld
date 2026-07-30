import { Router } from 'express';
import { protect } from '../middeware/authMiddleware.js';
import { uploadFile } from '../middeware/uploadMiddleware.js';
import { uploadToCloudinary, downloadFile } from '../controllers/fileController.js';

const router = Router();

router.get('/download', downloadFile);

router.use(protect);

router.post('/upload', uploadFile, uploadToCloudinary);

export default router;