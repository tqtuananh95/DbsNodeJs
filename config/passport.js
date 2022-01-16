var session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
    passport.use(new LocalStrategy(function (username, password, done) {
        
        User.findOne({username: username}, function (err, user) {
            if (err) console.log(err);
            
            if (!user) {
                session.messages = {"type": "alert alert-danger","success": "No user found!"};
                return done(null, false, {message: 'No user found!'});
            }

            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) console.log(err);
                
                if (isMatch) {
                    session.user = user;
                    return done(null, user);
                } else {
                    session.messages = {"type": "alert alert-danger","success": "Wrong password!"};
                    return done(null, false, {message: 'Wrong password!'})
                }
            })
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        })
    })
}