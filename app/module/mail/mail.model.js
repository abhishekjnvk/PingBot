const mongoose = require('mongoose');
const MailSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        trim:true,
        ref: 'Users'
    },
    website_id: {
        type: String,
        required: true,
        trim:true,
        ref: 'Websites'
    },
    subject:{
        type: String,
        required: true,
        trim:true,
    },
    message:{
        type:String,
        required: true,
        trim:true,
    },
    message_id:{
        type: String,
        required: true,
        trim:true,
    },
    created_at:{
        type:Number,
        default:Date.now(),
    }
}, {
    strict: false,
    versionKey: false,
});
  
module.exports = mongoose.model('MailLogs', MailSchema);
