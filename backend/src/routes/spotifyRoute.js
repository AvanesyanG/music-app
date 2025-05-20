import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { 
  searchSongs, 
  searchAlbums, 
  getAlbumTracks, 
  getTopTracks,
  getRecommendations 
} from '../controllers/spotifyController.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Search routes
router.get('/search/songs', searchSongs);
router.get('/search/albums', searchAlbums);

// Album routes
router.get('/album/:id/tracks', getAlbumTracks);

// Discovery routes
router.get('/top-tracks', getTopTracks);
router.get('/recommendations', getRecommendations);

export default router; 