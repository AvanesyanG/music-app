import mongoose from 'mongoose';

const clientOptions = {
    dbName: 'spotify',
    useNewUrlParser: true,
    useUnifiedTopology: true
};

async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables.");
        }

        await mongoose.connect(process.env.MONGODB_URI, clientOptions);

        // Optional: Verify connection
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("✅ Pinged your deployment. Successfully connected to MongoDB!");
    } catch (error) {
        console.error("❌ Connection error:", error.message);
        process.exit(1);
    }
}

export default connectDB;
