import Artist from '../models/artistModel.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Add a new artist
// @route   POST /api/artists
// @access  Private
const addArtist = asyncHandler(async (req, res) => {
    try {
        const { name, image, spotifyId, genres, popularity } = req.body;
        const userId = req.auth.mongoUserId;

        // Validate required fields
        if (!name || !spotifyId) {
            res.status(400);
            throw new Error('Name and Spotify ID are required');
        }

        // Check if artist already exists for this user
        const exists = await Artist.existsForUser(userId, spotifyId);
        if (exists) {
            res.status(400);
            throw new Error('Artist already added to your list');
        }

        // Add the artist for the user
        const artist = await Artist.addForUser(userId, {
            name,
            image,
            spotifyId,
            genres: genres || [],
            popularity: popularity || 0
        });

        res.status(201).json({
            success: true,
            artist
        });
    } catch (error) {
        console.error('Error in addArtist:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error adding artist',
            error: error.stack
        });
    }
});

// @desc    Get all artists for a user
// @route   GET /api/artists
// @access  Private
const getArtists = asyncHandler(async (req, res) => {
    try {
        const userId = req.auth.mongoUserId;
        
        // Get all artists for the user
        const artists = await Artist.getUserArtists(userId);
        
        res.status(200).json({ artists });
    } catch (error) {
        console.error('Error in getArtists:', error);
        res.status(500).json({ 
            message: 'Error fetching artists',
            error: error.message 
        });
    }
});

// @desc    Remove an artist
// @route   DELETE /api/artists/:id
// @access  Private
const removeArtist = asyncHandler(async (req, res) => {
    try {
        const userId = req.auth.mongoUserId;
        const artistId = req.params.id;

        const artist = await Artist.findOne({ _id: artistId, userId });

        if (!artist) {
            res.status(404);
            throw new Error('Artist not found');
        }

        await artist.deleteOne();
        res.status(200).json({ message: 'Artist removed successfully' });
    } catch (error) {
        console.error('Error in removeArtist:', error);
        res.status(error.status || 500).json({
            message: error.message || 'Error removing artist',
            error: error.stack
        });
    }
});

export {
    addArtist,
    getArtists,
    removeArtist
}; 