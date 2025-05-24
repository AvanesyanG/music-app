import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artist from '../models/artistModel.js';
import userModel from '../models/userModel.js';

dotenv.config();

const defaultArtists = [
    {
        name: "The Beatles",
        image: "https://i.scdn.co/image/ab6761610000e5ebdc9d4448cc417f3d8f3b2e4c",
        spotifyId: "3WrFJ7ztbogyGnTHbHJFl2",
        genres: ["rock", "british invasion", "classic rock"],
        popularity: 95
    },
    {
        name: "Queen",
        image: "https://i.scdn.co/image/ab6761610000e5ebce1a498e413893d0767f7bcf",
        spotifyId: "1dfeR4HaWDbWqFHLkxsg1d",
        genres: ["rock", "glam rock", "classic rock"],
        popularity: 94
    },
    {
        name: "Michael Jackson",
        image: "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9",
        spotifyId: "3fMbdgg4jU18AjLCKBhRSm",
        genres: ["pop", "r&b", "soul"],
        popularity: 96
    },
    {
        name: "Madonna",
        image: "https://i.scdn.co/image/ab6761610000e5ebd8b9980db67272cb4d2c3daf",
        spotifyId: "6tbjWDEIzxoDsBA1FuhfPW",
        genres: ["pop", "dance pop", "pop rock"],
        popularity: 93
    },
    {
        name: "David Bowie",
        image: "https://i.scdn.co/image/ab6761610000e5ebc02d416c309a68b04dc94576",
        spotifyId: "0oSGxfWSnnOXhD2fKuz2Gy",
        genres: ["art rock", "glam rock", "rock"],
        popularity: 92
    }
];

const seedDefaultArtists = async (userId) => {
    try {
        console.log(`Seeding default artists for user: ${userId}`);

        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            console.log(`User ${userId} not found`);
            return;
        }

        // Add each default artist for the user
        for (const artistData of defaultArtists) {
            try {
                // Check if artist already exists for this user
                const exists = await Artist.existsForUser(userId, artistData.spotifyId);
                if (!exists) {
                    await Artist.addForUser(userId, artistData);
                    console.log(`Added ${artistData.name} for user ${userId}`);
                } else {
                    console.log(`${artistData.name} already exists for user ${userId}`);
                }
            } catch (error) {
                console.error(`Error adding ${artistData.name}:`, error.message);
            }
        }

        console.log(`Finished seeding artists for user ${userId}`);
    } catch (error) {
        console.error('Error in seedDefaultArtists:', error);
    }
};

// Function to seed artists for all users
const seedAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await userModel.find({});
        console.log(`Found ${users.length} users`);

        for (const user of users) {
            await seedDefaultArtists(user._id);
        }

        console.log('Finished seeding all users');
    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Export both functions
export { seedDefaultArtists, seedAllUsers };

// If this file is run directly, seed all users
if (process.argv[1] === import.meta.url) {
    seedAllUsers();
} 