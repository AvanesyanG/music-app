import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
        name: {type: String, required: true},
        artist: {type: String, required: true},
        desc: {type: String, required: true},
        bgColor: {type: String, required: true},
        image: {type: String, required: true},
        userId: { type: String, required: true },
        songs: [{type: mongoose.Schema.Types.ObjectId, ref: 'song'}],
        spotifyId: { type: String },
        spotifyUrl: { type: String }
    },{timestamps: true})
const albumModel = mongoose.models.album || mongoose.model('album', albumSchema);

export default albumModel;