'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');

exports.registerUser = (firstName, lastName, email, password) =>

	new Promise((resolve,reject) => {
	  const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);

		const newUser = new user({
			first_name: firstName,
			last_name: lastName,
			email: email,
			hashed_password: hash
		});

		newUser.save()

		.then(() => resolve({ status: 201, message: 'User Registered Sucessfully !' }))

		.catch(err => {
			if (err.code == 11000) {
				reject({ status: 409, message: 'User Already Registered !' });
			} else {
				reject({ status: 500, message: 'Internal Server Error !' });
			}
		});
	});
	module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(newUser.hashed_password, salt, function(err, hash) {
					newUser.hashed_password= hash;
					newUser.save(callback);
			});
	});
}
