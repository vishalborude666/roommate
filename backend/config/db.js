import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const fallbackUri = "mongodb://127.0.0.1:27017/roomatch";
    const rawUri = process.env.MONGO_URI?.trim();
    const mongoUri = rawUri && /^mongodb(\+srv)?:\/\//i.test(rawUri) ? rawUri : fallbackUri;

    if (!rawUri || mongoUri !== rawUri) {
      console.warn(`Using fallback MongoDB URI: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
