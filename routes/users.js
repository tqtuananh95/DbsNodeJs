const express = require('express');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { body, validationResult, check} = require('express-validator');

// Models User
const User = require('../models/user');

// Get register page
router.get('/register', function(req, res) {

    res.render('./_layouts/register', {
        errors: req.session.errors,
        title: 'Register Page',
    });
    session.messages = "";
    session.user = "";
});

// POST register page
router.post('/register',
    body('name', 'Name is required!').notEmpty(),
    body('email', 'Email is required!').isEmail(),
    body('username', 'Username is required!').notEmpty(),
    body('password', 'Password is required!').notEmpty(),
    (req, res) => {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./_layouts/register', {
            errors: errors.array(),
            message: session.messages,
            user: null,
            title: 'Register Page'
        });
    } else {
        
        User.findOne({username: username}, function (err, user) {
            if (err) console.log(err);

            if (user) {
                
                session.messages = {"type": "alert alert-danger","success": "Username exists, choose another!"};
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });
                
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) console.log(err);

                        user.password = hash;
                        
                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                session.messages = {"type": "alert alert-success","success": "You are now registered!"};
                                res.redirect('/users/login');
                            }
                        });
                    });
                });
            }
        });
    }
});

// Get login page
router.get('/login', function(req, res) {

    if (res.locals.user) res.redirect('/');

    res.render('./_layouts/login', {
        title: 'Login Page',
    });
    session.messages = "";
});

// POST login page
router.post('/login', function(req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Get logout page
router.get('/logout', function(req, res) {

    session.user = "";

    session.messages = {"type": "alert alert-success","success": "You are logged out!"};;
    res.redirect('/users/login');
});

// Exports
module.exports = router;