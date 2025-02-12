const mongoose = require('mongoose');

const user_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,  
    },
    image: {
        type: String,
    },
    mobile:{
        type : Number,
    },
    email: {
        type: String,
        required: true,  
        unique: true
    },
    password: {
        type: String,
        required: true,  
    },
});

const UserData = mongoose.model('user', user_schema);
module.exports = UserData;
