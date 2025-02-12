const mongoose = require('mongoose');

// Sub-schema for comments
const commendSchema = new mongoose.Schema({
    email: { type: String },  // User's email
    name: { type: String },   // User's name
    description: { type: String }, // Comment text
    date: { type: Date, default: Date.now }  // Default current date
});

// Blog schema
const blog_schema = new mongoose.Schema({
    email: {
        type: String,    
        required: true,  
    },
    name: {
        type: String,
        required: true,  
    },
    blog_title: {
        type: String,
        required: true,  
    },
    blog_description: {
        type: String,
        required: true,  
    },
    image: {
        type: String,
    },
    link: {
        type: String,
    },
    likes:{ 
        type: Number,
    },
    comments: [commendSchema],  
    date: {
        type: Date,
        default: Date.now,  
    },
});

// Model export
const Blog = mongoose.model('Blog_data', blog_schema);
module.exports = Blog;
