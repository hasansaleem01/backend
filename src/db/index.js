import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // 1. Ensure you store the resolved value in connectionInstance
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`);

        // 2. Now connectionInstance is defined and accessible
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
};

export default connectDB;