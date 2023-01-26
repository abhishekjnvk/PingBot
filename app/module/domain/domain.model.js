const mongoose = require('mongoose');
const {API_METHODS} = require('./domain.constants');

const DomainSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    url:{
        type:String,
        required:true,
        trim:true
    },
    method:{
        type:String,
        required:true,
        enum: Object.values(API_METHODS),
        default: API_METHODS.GET
    },
    timeout:{
        type:Number,
        required:true,
        default:60,
    },
    user_id:{
        type:String,
        required:true,
        ref:'User'
    },
    tags:[
        {
            type:String,
        }
    ],
    email_alert: {           //TODO: MAKE USE OF THIS
        type: Boolean,
        default: true
    },
    sms_alert: {
        type: Boolean,
        default: false
    },
    sms_time:{
        type:Number,
        default: 30
    },
    email_time:{
        type:Number,
        default: 30
    },
    
    created_at:{
        type:Number,
        default:Date.now(),
    }
}, {
    strict: false,
    versionKey: false,
});
  
module.exports = mongoose.model('Websites', DomainSchema);