import express from 'express';
import { protectRoute, ensureUser } from '../middleware/authMiddleware.js';
import {
    addArtist,
    getArtists,
    removeArtist
} from '../controllers/artistController.js';

const router = express.Router();

// Add route debugging
router.use((req, res, next) => {
    console.log('=== Artist Route Hit ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('=====================');
    next();
});

router.route('/')
    .get(protectRoute, ensureUser, getArtists)
    .post(protectRoute, ensureUser, addArtist);

router.route('/:id')
    .delete(protectRoute, ensureUser, removeArtist);

export default router; 