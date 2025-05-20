import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function resetUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop the users collection
        await mongoose.connection.collection('users').drop();
        console.log('Users collection dropped successfully');

        // Create new indexes
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
            timestamps: true
        });

        // Create indexes
        userSchema.index({ clerkId: 1 });
        userSchema.index({ email: 1 });

        // Create the model and collection
        const User = mongoose.model('user', userSchema);
        await User.createCollection();
        console.log('Users collection recreated with new schema');

        console.log('Reset completed successfully');
    } catch (error) {
        console.error('Error resetting users:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

resetUsers(); 