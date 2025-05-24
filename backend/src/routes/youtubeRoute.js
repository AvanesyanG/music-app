import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { searchVideos } from '../controllers/youtubeController.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Search routes
router.get('/search', searchVideos);

export default router; 