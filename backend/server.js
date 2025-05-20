import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

import connectDB from './src/config/mongodb.js';
import songRouter from './src/routes/songRoute.js';
import albumRouter from './src/routes/albumRoute.js';
import userRouter from './src/routes/userRoute.js';
import authRouter from './src/routes/authRoute.js';
import spotifyRouter from './src/routes/spotifyRoute.js';

await connectDB().catch(console.dir);

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
        origin: req.headers.origin,
        'access-control-allow-origin': res.getHeader('access-control-allow-origin')
    });
    next();
});

app.use(express.json());

// Initialize Clerk
if (!process.env.CLERK_SECRET_KEY) {
    throw new Error('Missing CLERK_SECRET_KEY environment variable');
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/song', songRouter);
app.use('/api/album', albumRouter);
app.use('/api/spotify', spotifyRouter);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log('CORS is configured to allow all origins in development mode');
});
