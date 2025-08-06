import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionState = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
        console.log(`\n Connected to MongoDB ! DB Host: ${connectionState.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;