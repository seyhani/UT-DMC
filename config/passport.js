var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
// var configAuth = require('./auth');
module.exports = function(passport) {
    
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy(User.authenticate()));
    
    passport.use(new LocalStrategy(function(username, password, done) {
        User.findOne({ username: username }).deepPopulate(["group","group.competiotion"]).exec( function(err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'Incorrect username.' });
            user.comparePassword(password, function(err, isMatch) {
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                }
            });
        });
    }));

};
