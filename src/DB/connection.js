import mongoose from "mongoose";
import { DB_URL } from "./../../Config/config.service.js";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Failed to connect to MongoDB");
  }
};

export default connectDB;
