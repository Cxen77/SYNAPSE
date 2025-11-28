import express from 'express';
import { authUser, registerUser, logoutUser } from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../utils/validationSchemas.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), registerUser);
router.post('/login', validate(loginSchema), authUser);
router.post('/logout', logoutUser);

export default router;
