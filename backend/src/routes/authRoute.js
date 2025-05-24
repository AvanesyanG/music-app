import express from 'express';
import { authCallback, getUserProfile } from '../controllers/authController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

// Public route for Clerk webhook
authRouter.post('/callback', authCallback);

// Protected route for getting user profile
authRouter.get('/profile', protectRoute, getUserProfile);

export default authRouter;