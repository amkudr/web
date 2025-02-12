const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/linkDB.sqlite');

/**
 * Connects to MongoDB using Mongoose.
 */
const connectMongoDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://anmkudrs:NH5QVuCcYPx1UWNo@webdevcluster.zycrt.mongodb.net/?retryWrites=true&w=majority&appName=WebDevCluster');
        console.log("✅ MongoDB connected...");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

/**
 * Connects to SQLite and initializes the database.
 */
const linkDB = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ SQLite connection error:', err.message);
    } else {
        console.log('✅ SQLite connected...');
    }
});

/**
 * Creates the `Links` table if it does not exist.
 */
linkDB.serialize(() => {
    linkDB.run(`
        CREATE TABLE IF NOT EXISTS Links (
            linkID INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            description TEXT,
            avgRating REAL DEFAULT 0,
            votes INTEGER DEFAULT 0,
            clicks INTEGER DEFAULT 0,
            imdbID TEXT NOT NULL,
            isPrivate BOOLEAN NOT NULL,
            filmname TEXT NOT NULL,
            creator TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error("❌ Error creating Links table:", err.message);
        } else {
            console.log("✅ Links table is ready...");
        }
    });
});

/**
 * Closes the SQLite connection.
 */
const closeSQLite = () => {
    return new Promise((resolve, reject) => {
        linkDB.close((err) => {
            if (err) {
                console.error("❌ Error closing SQLite:", err.message);
                reject(err);
            } else {
                console.log("✅ SQLite connection closed.");
                resolve();
            }
        });
    });
};

// Export both MongoDB and SQLite connections
module.exports = { connectMongoDB, linkDB, closeSQLite };
