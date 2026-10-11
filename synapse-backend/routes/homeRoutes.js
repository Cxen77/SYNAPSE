import express from 'express';
const router = express.Router();
import { getHomeData } from '../controllers/homeController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

router.route('/').get(optionalProtect, getHomeData);

export default router;
