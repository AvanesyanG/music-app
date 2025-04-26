import mongoose from 'mongoose';

const clientOptions = {
    serverApi: { version: '1', strict: true, deprecationErrors: true }
};

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. Successfully connected to MongoDB!");
    } catch (error) {
        console.error("Connection error:", error);
        process.exit(1);
    }
}

export default connectDB;
