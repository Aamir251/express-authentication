const express = require('express')
const routes = express()
const bodyparser = require('body-parser')
const user = require('../model/user.js')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('connect-flash');
const session = require('express-session')
const cookieparser = require('cookie-parser')
const localStrategy = require('passport-local').Strategy
routes.use(bodyparser.urlencoded({ extended: true }))

routes.use(cookieparser('secret'));
routes.use(
    session({
        secret: 'secret',
        resave: true,
        maxAge: 3600000,
        saveUninitialized: true
    })
)
routes.use(passport.initialize());
routes.use(passport.session());
routes.use(flash())
routes.use((req, res, next) => {
    res.locals.success_message = req.flash("success_message");
    res.locals.error_message = req.flash("error_message");
    res.locals.error = req.flash("error");
    next()
})
const checkAuthentication = (req, res, next) => {
    //this is also a middleware
    if (req.user) {
        res.set(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0"
        );
        return next();
    } else {
        res.redirect("/login");
    }
};

routes.get("/login", (req, res) => {
    res.render("login.ejs")
})

routes.get("/register", (req, res) => {
    res.render("register.ejs")
})

routes.post("/register", (req, res) => {
    let { email, password, confirmpassword } = req.body;
    let err;

    if (!email || !password || !confirmpassword) {
        err = "Please Fill all the details properly"
        res.render("regiser.ejs", { err: err })
    }

    if (password !== confirmpassword) {
        err = "passwords did not match!"
        res.render("register.ejs", { err: err })
    }

    if (typeof err === 'undefined') {
        user.findOne({ email: email }, (err, data) => {
            if (err) throw err
            if (data) {
                err = "User already exists with that email"
                res.render("register.ejs", { err: err })
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    else {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) {
                                throw err
                            } else {
                                password = hash;
                                user({
                                    email,
                                    password
                                }).save((err, data) => {
                                    if (err) {
                                        throw err
                                    } else {
                                        req.flash(
                                            "success_message", "Registered Successfully. Please Login To Continue..."
                                        )
                                        res.redirect("/login")
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})
routes.get("/login", (req, res) => {
    res.render("login.ejs")
})
///authentication strategy for Login
passport.use(
    new localStrategy({ usernameField: "email" }, (email, password, done) => {
        user.findOne({ email: email }, (err, data) => {
            if (err) {
                throw err
            }
            if (!data) {
                return done(null, false, { message: "User doesn't exist" });
            }
            bcrypt.compare(password, data.password, (err, match) => {
                if (err) {
                    return done(null, false)
                }
                if (!match) {
                    return done(null, false)
                }
                if (match) {
                    return done(null, data)
                }
            })
        })
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
    user.findById(id, (err, user) => {
        cb(err, user)
    })
})
routes.get("/", (req, res) => {
    res.render("home.ejs", { user: req.user })
})
routes.post("/login", (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: "/login",
        successRedirect: "/",
        failureFlash: true
    })(req, res, next);
})

routes.post("/addmessage", checkAuthentication, (req, res) => {
    // const { message } = req.body;
    user.findOneAndUpdate(
        { email: req.user.email },
        {
            $push: {
                messages: req.body['message']
            }
        }, (err, success) => {
            if (err) {
                throw err
            }
            if (success) {
                console.log("Message Added successfull");
            }
        }
    )
    res.redirect("/")
})
routes.post("/deletemessage", checkAuthentication, async (req, res) => {
    let messageToDelete = await req.body['message']
    await user.findOneAndUpdate(
        { email: req.user.email },
        {
            $pull: {
                messages: messageToDelete
            }
        },
        { new: true },
        (err, success) => {
            if (err) {
                throw err
            }
            if (success) {
                console.log("Message Delete Successfully " + req.body['message']);
            }
        }
    )
    await res.redirect("/")
})

module.exports = routes;