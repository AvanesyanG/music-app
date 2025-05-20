import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import albumRoute from './routes/albumRoute.js';
import songRoute from './routes/songRoute.js';
import artistRoute from './routes/artistRoute.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/albums', albumRoute);
app.use('/api/songs', songRoute);
app.use('/api/artists', artistRoute);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 