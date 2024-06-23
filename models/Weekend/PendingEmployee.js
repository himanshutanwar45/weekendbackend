const mongoose = require('mongoose')
const {Schema} = mongoose

const PendingEmployee =  new Schema({
    empCode:{
        type:String,
        require:true
    },

    empName:{
        type:String,
        require:true
    },

    date:{
        type:Date
    },

    status:{
        type:String
    },

    monthYear:{
        type:String,
        require:true
    },

    createdBy:{
        type:String,
        require:true
    },

    createDate:{
        type:Date,
        default:Date.now()
    },

    updatedBy:{
        type:String,
        require:true
    },
    updatedDate:{
        type:Date,
        default:Date.now()
    }

})

const pendingEmployee = mongoose.model( 'pendingemployees',PendingEmployee);
module.exports=pendingEmployee;