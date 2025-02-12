const mongoose = require('mongoose');

const URL = 'mongodb+srv://sayan12:sayan12@cluster0.iylae.mongodb.net/BlogApp';

const connectDb = async () => {
    try {
        await mongoose.connect(URL);
        console.log("✅ Database Connected Successfully");
    } catch (error) {
        console.error("❌ Database Connection Failed:", error.message);
        process.exit(1); // Stop server if DB fails
    }
};

module.exports = connectDb;
