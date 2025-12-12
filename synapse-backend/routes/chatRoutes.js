import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getChats, getChatHistory, sendMessage, markRead, accessChat, getChatById } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect); // All chat routes protected

router.route('/').get(getChats).post(accessChat);
router.get('/history/:chatId', getChatHistory);
router.post('/send', sendMessage);
router.post('/read', markRead);
router.get('/:chatId', getChatById);

export default router;
