const mongoose = require('mongoose')
const {Schema} = mongoose

const Weekend =  new Schema({
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

const weekend = mongoose.model( 'weekend',Weekend);
module.exports=weekend;