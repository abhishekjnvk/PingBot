const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    isGoogleLogin: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: String,
        trim: true
    },
    picture: {
        type: String,
        trim: true
    },
    created_at: {
        type: Number,
        default: Date.now()
    },
}, {
    strict: false,
    versionKey: false,
});

module.exports = mongoose.model('Users', UserSchema);