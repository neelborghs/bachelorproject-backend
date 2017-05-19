'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	first_name: String,
	last_name: String,
	email: {type: String, unique: true},
	hashed_password: String,
	user_id: {type: String, default: null},
	profile_picture_url: {type: String, default: null},
	temp_password: String,
	temp_password_time: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

const User = mongoose.model('user', UserSchema);
module.exports = User;
