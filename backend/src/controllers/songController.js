import cloudinary from "../config/cloudinary.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import mongoose from "mongoose";

const addSong = async (req, res) => {
    try {
        // Destructure files properly
        const { file: audioFiles, image: imageFiles } = req.files;
        console.log(audioFiles, imageFiles);
        const audioFile = audioFiles[0];
        const imageFile = imageFiles[0];

        // Upload to Cloudinary using a buffer instead of a path
        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
            folder: "songs"
        });

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            folder: "covers"
        });

        const {name, desc, album: albumName} = req.body;
        
        // Find album by name and get its ID
        let album = null;
        if (albumName && albumName !== "none") {
            const foundAlbum = await albumModel.findOne({ name: albumName });
            if (foundAlbum) {
                album = foundAlbum._id; // This is already an ObjectId
            }
        }

        const formatDuration = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        const duration = formatDuration(audioUpload.duration);

        const songData = {
            name,
            desc,
            album, // This will be null or a valid ObjectId
            file: audioUpload.secure_url,
            image: imageUpload.secure_url,
            duration: duration.toString()
        };

        console.log("Creating song with data:", songData);

        const song = new songModel(songData);
        await song.save();
        if (album) {
            await albumModel.findByIdAndUpdate(album, {
                $push: { songs: song._id }
            });
        }
        res.json({success: true, message: "Song added successfully"});

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.toString()
        });
    }
}

const listSong = async (req,res) => {
    try {
        const allSongs = await songModel.find({}).populate('album','name')
        res.json({success:true,songs:allSongs})
    } catch (error) {
        console.error('Error listing songs:', error);
        res.json({success:false, error: error.message})
    }
}

const removeSong = async (req,res) => {
    try {
        const {id} = req.params;
        const song = await songModel.findById(id);
        //if song belongs to an album, update the album's songs array
        if(song.albumId) {
            await albumModel.findByIdAndUpdate(song.albumId, {
                $pull: {songs: song._id}
            });
        }
        await songModel.findByIdAndDelete(id);

       
        res.status(200).json({success:true,message:"Song removed successfully"});        
        
    } catch (error) {
        console.error('Error removing song:', error);
        res.json({success:false, error: error.message})
    }
}

export {addSong, listSong, removeSong}
