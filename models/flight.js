const mongoose = require('mongoose')

const flightSchema = new mongoose.Schema({
    flight_id:{
        type:Number,
        unique:true,
        required:true,
    },
    source:{
        type:String,
        required:true,
    },
    destination:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true,
    },
    arrivaltime:{
        type:String,
        required:true,
    },
    departuretime:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model('Flight',flightSchema)