import cloudinary from "../config/cloudinary.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import mongoose from "mongoose";

const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const addSong = async (req, res) => {
    try {
        const { userId } = req.auth; // Get userId from Clerk auth
        const { file: audioFiles, image: imageFiles } = req.files;
        const audioFile = audioFiles[0];
        const imageFile = imageFiles[0];

        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
            folder: "songs"
        });

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            folder: "covers"
        });

        const { name, artist, desc, album: albumName } = req.body;
        
        // Find album by name and user ID
        let album = null;
        if (albumName && albumName !== "none") {
            const foundAlbum = await albumModel.findOne({ name: albumName, userId });
            if (foundAlbum) {
                album = foundAlbum._id;
            }
        }

        const songData = {
            name,
            artist,
            desc,
            album,
            file: audioUpload.secure_url,
            image: imageUpload.secure_url,
            duration: formatDuration(audioUpload.duration).toString(),
            userId // Add userId to song data
        };

        const song = new songModel(songData);
        await song.save();
        
        if (album) {
            await albumModel.findByIdAndUpdate(album, {
                $push: { songs: song._id }
            });
        }
        
        res.json({ success: true, message: "Song added successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.toString()
        });
    }
};

const listSong = async (req, res) => {
    try {
        const { userId } = req.auth; // Get userId from Clerk auth
        const allSongs = await songModel.find({ userId }).populate('album', 'name');
        res.json({ success: true, songs: allSongs });
    } catch (error) {
        console.error('Error listing songs:', error);
        res.json({ success: false, error: error.message });
    }
};

const removeSong = async (req, res) => {
    try {
        const { userId } = req.auth; // Get userId from Clerk auth
        const { id } = req.params;
        
        // Only allow deletion if the song belongs to the user
        const song = await songModel.findOne({ _id: id, userId });
        if (!song) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this song" });
        }

        if (song.album) {
            await albumModel.findByIdAndUpdate(song.album, {
                $pull: { songs: song._id }
            });
        }
        
        await songModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Song removed successfully" });
    } catch (error) {
        console.error('Error removing song:', error);
        res.json({ success: false, error: error.message });
    }
};

export { addSong, listSong, removeSong };
