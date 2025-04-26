import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './src/config/mongodb.js';
import songRouter from './src/routes/songRoute.js';
import albumRouter from './src/routes/albumRoute.js';

await connectDB().catch(console.dir);

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/song', songRouter);
app.use('/api/album', albumRouter);
app.get('/', (req, res) => res.send('API working'));

// Server Listener
app.listen(port, () => console.log(`Server started on port ${port}`));
