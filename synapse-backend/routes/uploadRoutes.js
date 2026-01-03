import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming you want protection

const router = express.Router();

router.post('/', protect, upload.single('image'), uploadImage);

export default router;
