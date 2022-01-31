const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    nameofpassenger:{
        type:String,
        required:true
    },
    flight_id:{
        type:Number,
        required: true,
    },
    user_id:{
        type:String,
        required:true,
    },
    seat_no:{
        type:Number,
        required:true,
    },
    seatclass:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    }
})

module.exports = mongoose.model('Ticket', ticketSchema)