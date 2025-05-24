import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }
}, { 
    timestamps: true // Adds createdAt and updatedAt
});

// Add index for faster queries
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });

// Drop any existing indexes that might cause conflicts
userSchema.indexes().forEach(index => {
    if (index[0].username) {
        userSchema.index(index[0], { unique: false });
    }
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
