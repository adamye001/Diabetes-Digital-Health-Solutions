const exphbs = require('express-handlebars')

// Import express
const express = require('express')
// Set your app up as an express app
const app = express()
const flash = require('express-flash')  // for showing login error messages
const session = require('express-session')  // for managing user sessions


// configure Handlebars
app.engine(
    'hbs',
    exphbs.engine({
        defaultLayout: 'main',
        extname: 'hbs',
    })
)
// set Handlebars view engine
app.set('view engine', 'hbs')

app.use(express.static('public'))

// Set up to handle POST requests
app.use(express.json()) // needed if POST data is in JSON format
app.use(express.urlencoded({ extended: false })) // only needed for URL-encoded input
app.use(flash())

// set up login sessions
app.use(
    session({
        // The secret used to sign session cookies (ADD ENV VAR)
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        name: 'demo', // The cookie name 
        saveUninitialized: false,
        resave: false,
        proxy: process.env.NODE_ENV === 'production', //  to work on Heroku
        cookie: {
            sameSite: 'strict',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // sessions expire after 1 hour
        },
    })
)

// link to our router
const mainRouter = require('./routes/mainRouter')

// get the Mongoose user model
const User = require('./models/user.js')
const Patient = require('./models/patient')

// our new model that will connect to MongoDB
require('./models/index.js')

// use PASSPORT
const passport = require('./passport.js')
app.use(passport.authenticate('session'))

// Passport Authentication middleware
const isAuthenticated = (req, res, next) => {
    // If user is not authenticated via Passport, redirect to login page
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    // Otherwise, proceed to next middleware function
    return next()
}


// --------  ROUTES START HERE  ----------

// the post-login routes are added to the end of the '/main' path
app.use('/main', isAuthenticated, mainRouter)

// ----   GETs   -----
// show login page
app.get('/login', (req, res) => { 
    // if user database is empty, create the superuser
    User.find({}, (err, users) => {
        if (users.length > 0) return;
        User.create({ username: 'superuser', password: 'singularity', displayname: 'superuser', usertype: 'admin' }, (err, user) => {
            if (err) { console.log(err); return; }
            console.log('Initial Superuser Created - pls change password')
            user.setPassword( "singularity", function(err) {
                user.save()
            })
        })
    })

    res.render('login', {flash: req.flash('error'), title: 'Login'})
  }
)

// When you hit the '/' endpoint go to the home page, login required.
app.get('/', isAuthenticated, (req, res) => {
    try {
        var dispName = req.user.displayname
        const patientId = req.user.patient_id
        const clinicianId = req.user.clinician_id

        Patient.findOne({ _id: patientId },(err, patient) => {
            var darkMode = null
            if (err) {
                console.log('unknown error')
            } else {
                //console.log("the patient is", patient)
                if (patient != null) {
                    if (patient.colour_scheme == "Dark") {
                        darkMode = "Dark"
                    }
                }
            }
            return res.render('home', {screenName: dispName, patId: patientId, clinId: clinicianId, mode: darkMode})
        })
    } catch (err) {
        return next(err)
    }
})

app.get('/aboutDiabetes', (req, res) => { 
    try {
        return res.render('aboutDiabetes')
    } catch (err) {
        return next(err)
    }
})

app.get('/aboutWebsite', (req, res) => { 
    try {
        return res.render('aboutWebsite')
    } catch (err) {
        return next(err)
    }
})

// ----   POSTs   -----
// process login attempt
app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),  // if bad login, send user back to login page
    (req, res) => { 
        res.redirect('/')   // login was successful, send user to home page
    }   
)

// process change password attempt
app.post('/changePassword', isAuthenticated, (req, res) => {
    User.findOne({ username: req.user.username },(err, user) => {
        if (err) {
            console.log('unknown error')
            req.flash('error', 'Error - Password Not Changed')
        } else {
            // Check if user was found in database
            if (!user) {
                console.log('user not found')
                req.flash('error', 'User not found - Password Not Changed')
            } else {
                user.setPassword( req.body.password, function(err) {
                    if(err) {
                        if(err.name === 'IncorrectPasswordError'){
                            console.log('incorrect password')
                            req.flash('error', 'Error - Password Not Changed')
                        } else {
                            console.log('Error ', err.name)
                            req.flash('error', 'Error - Password Not Changed')
                        }
                    } else {
                        user.save()
                    }
                })
            }
        }
    }) 
    req.flash('success', 'Password Changed') 
    res.redirect('/main/accountView')   // send to home page
    }   
)

// user logs out
app.post('/logout', (req, res) => {
    req.logout()          // kill the session
    res.redirect('/')     // redirect user to Home page, which will bounce them to Login page
})


// attempts to access any other routes get a 404 error 
app.get('*', (req, res) => {
    res.render('404.hbs')
})

// END OF ROUTES


// Tells the app to listen on port 3000 and logs that information to the console.
app.listen(process.env.PORT || 3000, () => {
    console.log('The library app is running!')
})

var hbs = exphbs.create({});

// some handlebars helpers
// greater than
hbs.handlebars.registerHelper('gt', function( a, b ){
    var next =  arguments[arguments.length-1];
    if (b == null) return next.inverse(this);
    return (a > b) ? next.fn(this) : next.inverse(this);
});

// less than
hbs.handlebars.registerHelper('lt', function( a, b ){
    var next =  arguments[arguments.length-1];
    if (b == null) return next.inverse(this);
    return (a < b) ? next.fn(this) : next.inverse(this);
});

