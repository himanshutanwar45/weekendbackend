const mongoose = require('mongoose');
const {Schema} = mongoose;

const Login_History = new Schema({
    empCode:{
        type:String,
        required:true
    },
    empName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    isAdmin:{
        type:String,
        default:'0'
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:"1"
    },
    createdDate:{
        type:Date,
        default: Date.now()
    },
    machineName:{
        type:String,
        required:true
    },
    ipAddress:{
        type:String,
        required:true
    }

})
const login_history = mongoose.model( 'loginhistories',Login_History);
module.exports = login_history;