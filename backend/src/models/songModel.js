import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
    name: { type: String, required: true },
    desc: { type: String, required: true },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'album',
        required: false
      },
    image: { type: String, required: true },
    file: { type: String, required: true },
    duration: { type: String, required: true },
    userId: { type: String, required: true },
});

// Better pattern for model definition
const songModel = mongoose.models.song || mongoose.model('song', songSchema);

export default songModel;