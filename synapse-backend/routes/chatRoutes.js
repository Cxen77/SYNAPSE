import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getChats,
    getChatHistory,
    sendMessage,
    markRead,
    accessChat,
    getChatById,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    leaveGroup,
    deleteChat
} from '../controllers/chatController.js';

const router = express.Router();

router.use(protect); // All chat routes protected

router.route('/').get(getChats).post(accessChat);
router.get('/history/:chatId', getChatHistory);
router.post('/send', sendMessage);
router.post('/read', markRead);

// Group Chat Routes
router.route('/group').post(createGroupChat);
router.route('/rename').put(renameGroup);
router.route('/groupadd').put(addToGroup);
router.route('/groupremove').put(removeFromGroup);
router.route('/leave').put(leaveGroup);
router.route('/delete').put(deleteChat);

router.get('/:chatId', getChatById);

export default router;
