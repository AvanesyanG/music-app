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
        const { name, desc, bgColor } = req.body;
        const imageFile = req.file;

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            folder: "covers"
        });

        const albumData = {
            name,
            desc,
            bgColor,
            image: imageUpload.secure_url,
            userId // Add userId to album data
        };

        const album = new albumModel(albumData);
        await album.save();
        
        res.json({ success: true, message: "Album added successfully" });
    } catch (error) {
        console.error('Error:', error);
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

export { addAlbum, listAlbum, removeAlbum, addDefaultAlbum };
