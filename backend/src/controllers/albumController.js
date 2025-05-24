import cloudinary from "../config/cloudinary.js";
import albumModel from "../models/albumModel.js";
import songModel from "../models/songModel.js";

const addDefaultAlbum = async (userId) => {
    try {
        // Check if user already has a Favorites album
        const existingAlbum = await albumModel.findOne({ name: "Favorites", userId });
        if (existingAlbum) {
            return existingAlbum;
        }

        // Create default album for the user with a simple default image
        const defaultAlbum = new albumModel({
            name: "Favorites",
            artist: "Various Artists",
            desc: "Your favorite songs",
            bgColor: "#1DB954",
            image: "https://res.cloudinary.com/dxqyvj1yn/image/upload/v1716182400/covers/default-album.png",
            userId
        });

        await defaultAlbum.save();
        return defaultAlbum;
    } catch (error) {
        console.error("Error creating default album:", error);
        throw error;
    }
};

const addAlbum = async (req, res) => {
    try {
        const { userId } = req.auth; // Get userId from Clerk auth
        
        // Log the entire request body and file
        console.log('Full request body:', req.body);
        console.log('Request file:', req.file);
        
        const { name, artist, desc, bgColor } = req.body;
        const imageFile = req.file;

        // Debug log to check received data
        console.log('Parsed album data:', {
            name,
            artist,
            desc,
            bgColor,
            hasImage: !!imageFile,
            userId
        });

        // Strict validation for required fields
        if (!name || !artist || !desc || !bgColor || !imageFile) {
            console.log('Missing required fields:', {
                name: !!name,
                artist: !!artist,
                desc: !!desc,
                bgColor: !!bgColor,
                image: !!imageFile
            });
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                receivedData: { name, artist, desc, bgColor, hasImage: !!imageFile }
            });
        }

        // Additional validation for artist field
        if (typeof artist !== 'string' || artist.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Artist field must be a non-empty string"
            });
        }

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            folder: "covers"
        });

        // Create album data object with strict validation
        const albumData = {
            name: name.trim(),
            artist: artist.trim(),
            desc: desc.trim(),
            bgColor,
            image: imageUpload.secure_url,
            userId
        };

        console.log('Creating album with data:', albumData);

        // Create and save the album with validation
        const album = new albumModel(albumData);
        
        // Validate the album before saving
        const validationError = album.validateSync();
        if (validationError) {
            console.error('Validation error:', validationError);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: validationError.message
            });
        }

        const savedAlbum = await album.save();
        
        // Verify the saved album has all required fields
        if (!savedAlbum.artist) {
            throw new Error('Album was saved without artist field');
        }
        
        console.log('Successfully saved album:', savedAlbum);
        
        // Return success response with the saved album
        res.json({ 
            success: true, 
            message: "Album added successfully", 
            album: savedAlbum 
        });
    } catch (error) {
        console.error('Error in addAlbum:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.toString()
        });
    }
};

const listAlbum = async (req, res) => {
    try {
        const { userId } = req.auth; // Get userId from Clerk auth
        
        // Get all albums for the user
        const albums = await albumModel.find({ userId }).populate('songs');
        
        // If no albums exist, create a default album
        if (albums.length === 0) {
            const defaultAlbum = await addDefaultAlbum(userId);
            albums.push(defaultAlbum);
        }
        
        res.json({ success: true, albums });
    } catch (error) {
        console.error('Error listing albums:', error);
        res.json({ success: false, error: error.message });
    }
};

const removeAlbum = async (req, res) => {
    try {
        const { userId } = req.auth; // Get userId from Clerk auth
        const { id } = req.params;
        
        // Find the album and check ownership
        const album = await albumModel.findOne({ _id: id, userId });
        if (!album) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized to delete this album" 
            });
        }

        // Prevent deletion of Favorites album
        if (album.name === "Favorites") {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot delete the Favorites album" 
            });
        }

        // Remove album reference from all songs
        await songModel.updateMany(
            { album: album._id },
            { $unset: { album: 1 } }
        );
        
        await albumModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Album removed successfully" });
    } catch (error) {
        console.error('Error removing album:', error);
        res.json({ success: false, error: error.message });
    }
};

const addSpotifyAlbum = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { name, artist, desc, image, spotifyId, spotifyUrl } = req.body;

        // Check if album already exists
        const existingAlbum = await albumModel.findOne({ spotifyId, userId });
        if (existingAlbum) {
            return res.status(400).json({
                success: false,
                message: "Album already exists in your library"
            });
        }

        // Create new album
        const album = new albumModel({
            name,
            artist,
            desc,
            bgColor: "#1DB954", // Default Spotify green
            image,
            userId,
            spotifyId,
            spotifyUrl
        });

        const savedAlbum = await album.save();
        res.json({ 
            success: true, 
            message: "Album added successfully",
            album: savedAlbum 
        });
    } catch (error) {
        console.error('Error adding Spotify album:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

export { addAlbum, listAlbum, removeAlbum, addDefaultAlbum, addSpotifyAlbum };
