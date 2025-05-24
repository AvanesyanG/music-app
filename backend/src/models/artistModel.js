import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    spotifyId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true // Add index for faster queries
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    // Additional fields we might want to track
    lastPlayed: {
        type: Date,
        default: null
    },
    playCount: {
        type: Number,
        default: 0
    },
    // New fields for better artist information
    genres: [{
        type: String,
        trim: true
    }],
    popularity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true
});

// Create a compound index to prevent duplicate artists for the same user
// This ensures a user can't add the same artist twice
artistSchema.index({ userId: 1, spotifyId: 1 }, { unique: true });

// Create an index on spotifyId for faster lookups
artistSchema.index({ spotifyId: 1 });

// Add a method to check if an artist exists for a user
artistSchema.statics.existsForUser = async function(userId, spotifyId) {
    return this.exists({ userId, spotifyId });
};

// Add a method to get all artists for a user
artistSchema.statics.getUserArtists = async function(userId) {
    return this.find({ userId })
        .sort({ addedAt: -1 })
        .lean();
};

// Add a method to add an artist for a user
artistSchema.statics.addForUser = async function(userId, artistData) {
    const artist = new this({
        ...artistData,
        userId
    });
    return artist.save();
};

const Artist = mongoose.model('Artist', artistSchema);

export default Artist; 