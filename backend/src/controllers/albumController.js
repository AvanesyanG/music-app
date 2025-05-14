import {v2 as cloudinary} from 'cloudinary';
import albumModel from '../models/albumModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const addDefaultAlbum = async (req, res) => {
    try {
        // Check if default album already exists
        const existingAlbum = await albumModel.findOne({ name: "Favorites" });
        if (existingAlbum) {
            console.log("Default album already exists");
            return res ? res.json({success: true, message: "Default album already exists"}) : null;
        }

        // Construct the correct path to fav.jpg
        const imagePath = path.join(__dirname, '../../../frontend/src/assets/fav.jpg');
        console.log("Attempting to upload image from:", imagePath);

        // Upload default image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imagePath, {
            resource_type: "image"
        });

        console.log("Image uploaded successfully:", imageUpload.secure_url);

        const albumData = {
            name: "Favorites",
            desc: "Your favorite tracks collection",
            bgColor: "#1E293B",
            image: imageUpload.secure_url
        };

        const album = albumModel(albumData);
        await album.save();
        console.log("Default album created successfully");
        if (res) {
            res.json({success: true, message: "Default album created successfully"});
        }
    } catch (error) {
        console.error("Error creating default album:", error);
        if (res) {
            res.json({success: false, error: error.message});
        }
    }
};

const addAlbum = async (req, res) => {
    try {
        const name = req.body.name;
        const desc = req.body.desc;
        const bgColor = req.body.bgColor;
        const imageFile = req.file;
        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"});

        const albumData = {
            name,
            desc,
            bgColor,
            image: imageUpload.secure_url
        }
        const album = albumModel(albumData);
        await album.save();
        res.json({success:true,message:"Album added successfully"})

    } catch (error) {
        res.json({success:false})
    }
}

const listAlbum = async (req, res) => {
    try {
        const allAlbums = await albumModel.find({});
        console.log("Current number of albums:", allAlbums.length);
        
        // If no albums exist, create the default album
        if (allAlbums.length === 0) {
            console.log("No albums found, creating default album...");
            await addDefaultAlbum(req, res);
            const updatedAlbums = await albumModel.find({});
            console.log("Albums after creating default:", updatedAlbums.length);
            return res.json({success:true, albums:updatedAlbums});
        } else {
            return res.json({success:true, albums:allAlbums});
        }
    } catch (error) {
        console.error("Error in listAlbum:", error);
        return res.json({success:false, error: error.message})
    }
}

const removeAlbum = async (req, res) => {
    try {
        const albumToDelete = await albumModel.findById(req.body.id);
        
        // Don't allow deletion of the Favorites album
        if (albumToDelete && albumToDelete.name === "Favorites") {
            return res.json({success:false, message:"Cannot delete the Favorites album"});
        }
        
        await albumModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Album removed successfully"});
    } catch (error) {
        res.json({success:false})
    }
}

export {addAlbum, listAlbum, removeAlbum, addDefaultAlbum};
