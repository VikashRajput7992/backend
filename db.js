const mongoose = require('mongoose');

require('dotenv').config({ path: '../.env.local' });

const mongoURI = process.env.MONGODB_URI;

// const mongoURI = "mongodb://127.0.0.1:27017/inotebook?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1";

const connectToMongo = ()=>{
    mongoose.connect(mongoURI).then(()=>{
        console.log("Connected to mongo successfully");
    })
}

module.exports = connectToMongo;