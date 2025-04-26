import cloudinary from "../config/cloudinary.js";
import songModel from "../models/songModel.js";

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
        const name = req.body.name;
        const desc = req.body.desc;
        const album = req.body.album;
        const duration = `${Math.floor(audioUpload.duration / 60)}:${audioUpload.duration % 60}`

        console.log("zzz", audioUpload.secure_url)
        console.log("zzz2", imageUpload.secure_url)

        const songData = {
            name,
            desc,
            album,
            file: audioUpload.secure_url,
            image: imageUpload.secure_url,
            duration: duration.toString()
        }
        const song = songModel(songData);
        await song.save();
        res.json({success:true,message:"Song added successfully"})
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false });
    }
}

const listSong = async (req,res) => {
    try {
        const allSongs = await songModel.find({})
        res.json({success:true,songs:allSongs})

    } catch (error) {
        res.json({success:false})
    }
}
const removeSong = async (req,res) => {
    try {
        await songModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Song removed successfully"})
    }catch (error) {
        res.json({success:false})
    }
}

export {addSong, listSong, removeSong}
