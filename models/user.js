const mongoose = require('mongoose')
const validator = require('validator')

const UserSchema = new mongoose.Schema({
    username:{
        required:true,
        type:String,
    },
    email:{
        required:true,
        type:String,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                 throw new Error("Email is invalid") 
            }
        }
    },
    password:{
        required:true,
        type:String,
        minlength:6,
        maxlength:16,
        trim:true,
    },
    phone:{
        type:Number,
        required:true,
        minlength:10,
        maxlength:11,
    },
})

module.exports = mongoose.model('User',UserSchema)