const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Keep up to 100 open socket connections for simultaneous user transactions
            maxPoolSize: 100,
            // Keep at least 10 connections open in the background for active queries
            minPoolSize: 10,
            // Sockets will timeout after 30 seconds of inactivity to release dead resources
            socketTimeoutMS: 30000,
            // Fail fast if MongoDB itself goes down rather than blocking Node indefinitely
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
