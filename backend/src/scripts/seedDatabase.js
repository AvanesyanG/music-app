import mongoose from 'mongoose';
import dotenv from 'dotenv';
import albumModel from '../models/albumModel.js';
import songModel from '../models/songModel.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables.");
        }
        
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'spotify',
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Drop existing collections
        await albumModel.collection.drop();
        await songModel.collection.drop();
        console.log('Dropped existing collections');

        // Create default album
        const defaultAlbum = new albumModel({
            name: "Favorites",
            artist: "Various Artists",
            desc: "Your favorite songs",
            bgColor: "#1DB954",
            image: "https://res.cloudinary.com/dxqyvj1yn/image/upload/v1716182400/covers/default-album.png",
            userId: "default"
        });

        await defaultAlbum.save();
        console.log('Created default album');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 