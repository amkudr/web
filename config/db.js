const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://anmkudrs:NH5QVuCcYPx1UWNo@webdevcluster.zycrt.mongodb.net/?retryWrites=true&w=majority&appName=WebDevCluster');
        console.log("MongoDB connected...");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
