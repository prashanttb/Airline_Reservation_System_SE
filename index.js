const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const connectDB = require('./config/db')
const ejs = require('ejs')



// load config file
dotenv.config({path:'./config/config.env'})

connectDB()

const app = express()

app.use(bodyParser.urlencoded({extended:false}))

// setting static folder
app.use(express.static(path.join(__dirname,'public')))



// setting view engine
app.set('view engine', 'ejs')

// sessions
const store = new MongoDBSession({
    uri: process.env.MONGO_URI,
    collection:"mySessions",
})
app.use(cookieParser())
app.use(session({
    secret: 'key that will sign cookie',
    resave:false,
    saveUninitialized:false,
    store:store,
}))


// routes
app.use('/',require('./routes/route'))



// creating server
const PORT = process.env.PORT || 5000
app.listen(PORT,console.log(`Server connected to port ${PORT}`))