const mongoose = require('mongoose')
const mongodb = require('mongodb')
require('dotenv').config()
const mongoURI = process.env.MONGOURL

async function connectToMongo() {
    await mongoose.connect(mongoURI,{dbName:'WeekendSupport'}).then(()=> console.log("Connected to Mongo Successfully")).catch(err => console.log(err));
  }


  
module.exports = connectToMongo;
