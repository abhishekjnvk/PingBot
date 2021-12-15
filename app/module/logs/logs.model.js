const mongoose = require('mongoose');
const LogSchema = new mongoose.Schema({
    website_id: {
        type: String,
        required: true,
        trim:true,
        ref: 'Websites'
    },
    user_id: {
        type: String,
        required: true,
        trim:true,
        ref: 'Users'
    },
    is_fine:{
        type:Boolean,
        required:false,
    },
    status:{
        type: Number,
        required: true,
    },
    response_time:{
        type: Number,
        required:true,
    },
    location:{
        type:String,
        trim:true
    },
    comment:{
        type:String,
        trim:true
    },
    created_at:{
        type:Number,
        default:Date.now(),
    }
}, {
    strict: false,
    versionKey: false,
});
  
module.exports = mongoose.model('Logs', LogSchema);