const mongoose = require('mongoose');
const {Schema} = mongoose;

const CreateUser = new Schema({
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
    createdBy:{
        type:String,
        required:true
    },
    updatedBy:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default: Date.now()
    },
    updatedDate:{
        type:Date,
        default: Date.now()
    }

})
const user = mongoose.model( 'logindetails',CreateUser);
module.exports=user;