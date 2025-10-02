import mongoose from "mongoose";

const connectToMongoDB = async () => {

    if (mongoose.connection.readyState) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        throw error; // preserve original error
    }
}


export { connectToMongoDB }