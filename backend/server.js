import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

import connectDB from './src/config/mongodb.js';
import songRouter from './src/routes/songRoute.js';
import albumRouter from './src/routes/albumRoute.js';
import userRouter from './src/routes/userRoute.js';
import authRouter from './src/routes/authRoute.js';

await connectDB().catch(console.dir);

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
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

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
