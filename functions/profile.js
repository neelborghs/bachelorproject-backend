'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');
var dateTime = require('node-datetime');

exports.getProfile = email =>
	new Promise((resolve,reject) => {
		user.find({ email: email }, { user_id: 1, first_name: 1, last_name: 1, email: 1, profile_picture_url: 1, _id: 0 })

		.then(users => resolve(users[0]))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }))
	});

exports.setUserId = (email, userId) =>
	new Promise((resolve, reject) => {
		user.find({ email: email })
		.then(users => {
			let user = users[0];
			user.user_id = userId;
			return user.save();
		})

		.then(user => resolve({ status: 200, message: 'User ID Updated Sucessfully !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));
	});

exports.editProfileUrl = (email, newUrl) =>
	new Promise((resolve, reject) => {
		user.find({ email: email })
		.then(users => {
			let user = users[0];
			user.profile_picture_url = newUrl;
			return user.save();
		})

		.then(user => resolve({ status: 200, message: 'Url Updated Sucessfully !' }))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }));
	});
	module.exports.getUserByEmail = function(email, callback){
		var query = {email: email};
		user.findOne(query, callback);
	}

	module.exports.comparePassword = function(candidatePassword, hash, callback){
		bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
	    if(err) throw err;
			callback(null, isMatch);
		});
	}

	module.exports.getUserByToken = function(resetPasswordToken, callback){
		var query = {resetPasswordToken: resetPasswordToken, resetPasswordExpires: { $gt: Date.now() }};
		user.findOne(query, callback);
	}
