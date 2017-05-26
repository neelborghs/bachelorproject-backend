var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var dateTime = require('node-datetime');
var User = require('../models/user');
const profile = require('../functions/profile');
const register = require('../functions/register');
const config = require('../config/config.json');
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

//login
router.get('/login', function(req, res){
	res.render('login');
});

//Forgot
router.get('/forgot', function(req, res){
	res.render('forgot');
});

// Register User
router.post('/register', function(req, res){
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	//console.log(name); //test to see if form gets name correctly

	// Validation
	req.checkBody('firstname', 'First name is required').notEmpty();
	req.checkBody('lastname', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();



	if(errors){
		res.render('register',{
			errors:errors
		});
	}else{
		profile.getUserByEmail(email, function(err, user){
			if(err) throw err;
			if(user){
				req.flash('error_msg','email already exists, use another email or go to the login page');
				res.redirect('/users/register');

			}else {

				var dt = dateTime.create();
				var formatted = dt.format('Y-m-d H:M:S');

					//If passed
					var newUser = new User({
						first_name: firstname,
						last_name: lastname,
						email: email,
						hashed_password: password,
						created_at: formatted,
						user_id: null
					});

					register.createUser(newUser, function(err, user){
						if(err) throw err;
						console.log(user);
					});

					req.flash('success_msg','You are registered and can login now');

					res.redirect('/users/login');

		}
		});
	}

});

passport.use(new LocalStrategy(
  function(email, password, done) {
    profile.getUserByEmail(email, function(err, user){
			if(err) throw err;
			if(!user){
				return done(null, false, {message: 'Unknown Email'});
			}

			profile.comparePassword(password, user.hashed_password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);

				}else {
					return done(null, false, {message: 'Invalid password'});
				}
			});
		});
  }));

	passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  profile.getUserByEmail(email, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: true}), //Deleted successRedirect for dynamic data, keeps working the same
  function(req, res) {

		res.redirect('/dashboard');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'you logged out successfully');

	res.redirect('/users/login');
});
//Forgot//
router.post('/forgot', function(req, res, next) {
	var emailForgot= req.body.email;
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      profile.getUserByEmail(emailForgot, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 300000; // 5 Minutes

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);
      var mailOptions = {
        to: emailForgot,
        from: config.email,
        subject: 'EZgreen Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});
//End Forgot//

var param="test";
var paramChecker=0;
router.get('/reset/:token', function(req, res) {
  profile.getUserByToken(req.params.token, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
		if (paramChecker==1){
			paramChecker = 0;
		}
		else{
			param = req.params.token
		}

		res.render('reset');
  });
});

router.post('/reset/:token', function(req, res) {
	var password = req.body.password;
	var password2 = req.body.password2;
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	var errors = req.validationErrors();
  async.waterfall([
    function(done) {
  profile.getUserByToken(param, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/users/login');
        }
				if(errors){
					res.render('reset',{
						errors:errors
					});
				}else{
					var salt = bcrypt.genSaltSync(10);
					var hash = bcrypt.hashSync(password, salt);
					user.hashed_password = hash;
					req.flash('success_msg', 'Password is successfully changed. You can now login with your new credentials.');
					user.resetPasswordToken = undefined;
					user.resetPasswordExpires = undefined;
					user.save();

					var email = user.email;
					var smtpTransport = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);
					var mailOptions = {
						to: user.email,
						from: config.email,
						subject: 'Your password has been changed',
						text: 'Hello,\n\n' +
							'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
					};
					smtpTransport.sendMail(mailOptions, function(err) {
						req.flash('success', 'Success! Your password has been changed.');
						done(err);
					});
					res.redirect('/users/login');
				}
      });
    },
    function(user, done) {

    }
  ], function(err) {
    res.redirect('/users/login');
  });
});

module.exports = router;
