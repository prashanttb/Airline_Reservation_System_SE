const express = require('express')
const User = require('../models/user')
const Admin = require('../models/admin')
const Flight = require('../models/flight')
const Ticket = require('../models/ticket')
const bcrypt = require('bcrypt')
const router = express.Router()

const ensureAuthUser = (req,res,next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/userlogin')
    }
}

const ensureAuthAdmin = (req,res,next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/adminlogin')
    }
}


const ensureGuestUser = (req,res,next)=>{
    if(req.session.isAuth){
        res.redirect('main')
    }else{
        return next()
    }
}

const ensureGuestAdmin = (req,res,next)=>{
    if(req.session.isAuth){
        res.redirect('viewflight')
    }else{
        return next()
    }
}

router.get('/',(req,res)=>{
    //console.log(req.session)
    res.render('home')
})

/*

* user routes

*/

router.get('/userlogin',ensureGuestUser,(req,res)=>{
    res.render('userlogin', {message:undefined})
})

// user login

router.post('/userlogin',async (req,res)=>{
    try {

        const usermail = await User.findOne({email:req.body.email})

        if(!usermail) res.render('signup', {message:"Email not registered please signup first"});

        else if(req.body.password === usermail.password){
            req.session.isAuth=true;
            req.session.user = usermail
            req.session.save()
            res.redirect('main')
        }

        else res.render('userlogin',{message:"Email and password do not match"})

    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
})

router.get('/signup',(req,res)=>{
    res.render('signup',{errors:[], message:""})
})

// display options in dropdown

router.get('/main',ensureAuthUser, async (req,res)=>{
    let flights=[]
    let sources =[]
    let destinations = []

    if(req.session.admin) {
        res.redirect('/viewflight')
    }
    else {
        try {
            sources = await Flight.find({},{source:1,_id:0}).distinct('source')
            destinations = await Flight.find({},{destination:1,_id:0}).distinct('destination')
            res.render('main',{flights,sources,destinations})
        } catch (err) {
            console.error(err)
        }

    }
})

// get flights based on search result

router.post('/main',ensureAuthUser, async (req,res)=>{
    try {
        flights = await Flight.find({date:req.body.date, source:req.body.source, destination: req.body.destination})
        sources = await Flight.find({},{source:1,_id:0}).distinct('source')
        destinations = await Flight.find({},{destination:1,_id:0}).distinct('destination')
        res.render('main',{flights,sources,destinations})
    } catch (err) {
        console.error(err)
    }
})

// user signup

router.post('/signup',async (req,res)=>{

    var password = req.body.password
    var cpassword = req.body.cpassword
    let errors=[]

    if(password.length<6){
        errors.push({message:"Passwords should be atleast 6 characters"})
    }

    if(password!=cpassword){
        errors.push({message:"Passwords do not match"})
    }

    if(errors.length>0){
        res.render('signup',{errors})
    }else{

        let hashedPassword = await bcrypt.hash(password,10);
        var result = await User.findOne({email:req.body.email})

        if(Object.keys(result).length!=0){
            errors.push({message:"Email already exist"})
            res.render('signup',{errors})
        }else{
            // insert query
            var user = await User.create({
                username:req.body.username,
                password:req.body.password,
                email:req.body.email,
                phone:req.body.phone,
            })
            res.redirect('/users/login')
        }
    }
})  

// view booked tickets by a user

router.get('/viewbooking',ensureAuthUser,async (req,res)=>{
    if(req.session.admin) res.redirect('/viewflight')
    else {
        try {
            var journey = await Ticket.find({user_id:req.session.user._id})
            var flight=[];
            for(var i=0;i<journey.length;i++){
                flight[i]= await Flight.find({flight_id:journey[i].flight_id})
            }
            res.render('viewbooking',{flight, journey})
        } catch (err) {
            console.error(err)
        }
    }
})


router.get('/bookflight', ensureAuthUser,(req,res)=>{
    res.render('bookflight',{flightid})
})

// book flight ticket

router.post('/book',async (req,res)=>{
    try {
        var bookedseats = await Ticket.find({flight_id:req.body.flightid},{seat_no:1,_id:0})
        req.session.user.flightid=req.body.flightid;
        res.render('bookflight',{bookedseats})
    } catch (err) {
        console.error(err)
        res.redirect('/main')
    }
})

// book flight ticket

router.post('/bookflight',ensureAuthUser,async(req,res)=>{
    try {

        var bookedseats = await Ticket.find({flight_id:req.session.user.flightid},{seat_no:1,_id:0})
        for(var i=0;i<bookedseats.length;i++){
            bookedseats[i]=bookedseats[i].seat_no;
        }

        if(bookedseats.includes(parseInt(req.body.seatno))){
             res.redirect('/viewbooking')
        }else{
            var seatclass="";
            if(req.body.seatno<20){
                seatclass = "Business Class";
            }else seatclass = "Economic Class";


            var price = await Flight.find({flight_id:req.session.user.flightid},{price:1,_id:0})
            price = parseInt(price[0].price)

            const journey = await Ticket.create({
                nameofpassenger:req.body.nameofpassenger,
                flight_id:req.session.user.flightid,
                user_id:req.session.user._id,
                seat_no:req.body.seatno,
                seatclass:seatclass,
                price:price,
            })
            delete req.session.user.flightid

            res.redirect('viewbooking')
        }




    } catch (err) {
        console.error(err)
        res.redirect('/main')
    }

})

// cancel booked ticket

router.post('/cancelbooking',ensureAuthUser,async (req,res)=>{
    try {
        var del = await Ticket.deleteOne({_id:req.body.journeyid})
        res.redirect('/viewbooking')
    } catch (err) {
        console.error(err)
        res.redirect('/main')
    }

})

/*

* admin routes

*/


router.get('/viewflight',ensureAuthAdmin,async (req,res)=>{
    if(req.session.user) {
        res.redirect('/main');
    }
    else {
        try {
            var flights = await Flight.find();
            const d = new Date().toISOString().slice(0,10)
            res.render('viewflight',{flights:flights})
        } catch (err) {
            console.error(err)
            res.redirect('/viewflight')
        }

    }
})

router.get('/newadmin',ensureAuthAdmin,(req,res)=>{
    if(req.session.user) res.redirect('/main');
    else res.render('newadmin')
})

// creating new admin

router.post('/newadmin',ensureAuthAdmin,async (req,res)=>{
    var admin = await Admin.create({
        adminname:req.body.adminname,
        email:req.body.email,
        password:req.body.password
    })
    res.render('viewflight')
})

router.get('/adminlogin',ensureGuestAdmin,(req,res)=>{
    res.render('adminlogin')
})

// admin login

router.post('/adminlogin',async (req,res)=>{
    try {
        const admin = await Admin.findOne({email:req.body.adminmail})

        if(req.body.password === admin.password ){
            req.session.isAuth=true;
            req.session.admin = admin
            req.session.save()
            res.redirect('viewflight')
        }
        else{
            res.redirect('/')
        }
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }

})

router.get('/addflight',ensureAuthAdmin,(req,res)=>{
    if(req.session.user) res.redirect('/main');
    else res.render('addflight')
})

// add/schedule new flight

router.post('/addflight',ensureAuthAdmin,async (req,res)=>{
    try {
        var flight = await Flight.create({
            flight_id: req.body.flightid,
            source: req.body.source,
            destination: req.body.destination,
            date: req.body.date,
            arrivaltime: req.body.arrivaltime,
            departuretime: req.body.departuretime,
            price: req.body.price,
        })
        res.redirect('/viewflight')
    } catch (err) {
        console.error(err)
        res.redirect('/addflight')
    }

})

// view all booked tickets

router.get('/adminviewbooking',ensureAuthAdmin,async (req,res)=>{
    if(req.session.user) res.redirect('/main');
    else {
        try {
            var journey = await Ticket.find()

            var flight=[];
            for(var i=0;i<journey.length;i++){
                flight.push(await Flight.find({flight_id:journey[i].flight_id}))
            }

            res.render('adminviewbooking',{journey,flight})
        } catch (err) {
            console.error(err)
            res.redirect('/viewflight')
        }

    }
})

// Cancel flight

router.post('/cancelflight',ensureAuthAdmin,async (req,res)=>{
    try {
        var del = await Flight.deleteOne({flight_id:req.body.flightid})
        del = await Ticket.deleteMany({flight_id:req.body.flightid})
        res.redirect('/viewflight')
    } catch (err) {
        console.error(err)
        res.redirect('/viewflight')
    }

})

// Logout

router.post('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/')
    })
})

module.exports = router