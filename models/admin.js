const mongoose = require('mongoose')
const validator = require('validator')

const AdminSchema = new mongoose.Schema({
    adminname:{
        unique:true,
        required:true,
        type:String,
    },
    email:{
        unique:true,
        required:true,
        type:String,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid email')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        maxlength:16,
        trim:true,
    }
})

module.exports = mongoose.model('Admin', AdminSchema)