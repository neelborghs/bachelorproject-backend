var express = require('express');
var sensors = require('../models/sensors');
var request = require('request');
var router = express.Router();
var sleep = require('system-sleep');
var jsonObject = "";
var addModule = null;
const profile = require('../functions/profile');

// Get Homepage
router.get('/dashboard', ensureAuthenticated, function(req, res){
	var name = req.user.first_name;
	var id = req.user.user_id;
	var email = req.user.email;
	var profilePicture = ""
	var html = "";
	var successUserId = "";

	var numberObjects = Object.keys(jsonObject).length;
	//html += "<h1>number objects: " + numberObjects + "</h1>"; //For testing numberObjects
	//if (numberObjects == 0){
		//AUTOMATIC MODULE ADD --- START ---
	if (req.user.user_id == null){
				html =   "<div class='w3-card-4' style='width:100%'><div class='w3-container'><br><p>No modules found!</p><hr><img src='/images/plant.png' alt='Avatar' class='w3-left w3-circle w3-margin-right' style='width: 10em'><p>There were no modules found.<p/><p>Make sure to first plug in the modules and then the gateway.</p><p>Once you did that you can refresh this page to automatically link it to your account.</p></div><div class='w3-container'><br></div></div>";
		request({url: 'https://api.myjson.com/bins/s7ogl', json: true}, function(err, res, json) {
			if(err){
				throw err;
			}
			//console.log(json);
			addModule = null;
			addModule = json;
			for (i in addModule){
				successUserId = addModule[i].string;
				html =   "<div class='w3-card-4' style='width:100%'>Naar link geweest "+ addModule[i].string +"</div>";
			}
		});
		sleep(500);
		if (successUserId!=""){
			profile.getUserByEmail(email, function(err, user) {
				if(err) throw err;
				user.user_id = successUserId;
				user.save();
			});
			request({url: 'https://ezgreen.herokuapp.com/api/modules/user/' + successUserId, json: true}, function(err, res, json) {
				if (err) {
					throw err;
				}
				//console.log(json);
				jsonObject = "";
				jsonObject = json;
				console.log(jsonObject);
			});
			//Set dynamic data here
			sleep(500); // sleep for 0.5 second, this helps refreshing the data
			html = ""
			for (i in jsonObject){
				if (jsonObject[i].moisture < 50)
				{
					html += "<div class='w3-card-4red' style='width:100%'>";
				}
				if (jsonObject[i].moisture >= 50 && jsonObject[i].moisture < 55){
								html += "<div class='w3-card-4orange' style='width:100%'>";
				}
				if (jsonObject[i].moisture >= 55){
								html += "<div class='w3-card-4green' style='width:100%'>";
				}
				html += "<div class='w3-container'><br><p>Module ID: " + jsonObject[i].module_id + "</p><hr><table><tr>";
				if (jsonObject[i].light==1)
				{
					html +=
											"<td><img src='/images/light.png' width='70%'><br><br><p>Light</p></td>";
				}
				else{
					html +=
											"<td><img src='/images/dark.png' width='70%'><br><br><p>Dark</p></td>";
				}
				html += 								"<td><img src='/images/hum.png' width='70%'><br><br><p>" +jsonObject[i].humidity + "%</p></td>" +
												"<td><img src='/images/temp.png' width='70%'><br><br><p>" +jsonObject[i].temperature + "°C</p></td>" +
												"<td><img src='/images/soil.png' width='70%'><br><br><p>" +jsonObject[i].moisture + "%</p></td>" +
											"</tr></table></div></div><br><br>";
				if (i==numberObjects -1){
					html+= "<br><br>"
				}
			}
			if (req.user.profile_picture_url!=null){
				profilePicture += "<li role='presentation'><img src='" + req.user.profile_picture_url + "' class='w3-left w3-round-xxlarge w3-margin-right' style='height:3em'></li>"
			}
		}
	}
		//AUTOMATIC MODULE ADD --- END ---
		else{

			request({url: 'https://ezgreen.herokuapp.com/api/modules/user/' + id, json: true}, function(err, res, json) {
				if (err) {
					throw err;
				}
				//console.log(json);
				jsonObject = "";
				jsonObject = json;
				console.log(jsonObject);
			});
			//Set dynamic data here
			sleep(500); // sleep for 0.5 second, this helps refreshing the data

			for (i in jsonObject){
				if (jsonObject[i].moisture < 50)
				{
					html += "<div class='w3-card-4red' style='width:100%'>";
				}
				if (jsonObject[i].moisture >= 50 && jsonObject[i].moisture < 55){
								html += "<div class='w3-card-4orange' style='width:100%'>";
				}
				if (jsonObject[i].moisture >= 55){
								html += "<div class='w3-card-4green' style='width:100%'>";
				}
				html += "<div class='w3-container'><br><p>Module ID: " + jsonObject[i].module_id + "</p><hr><table><tr>";
				if (jsonObject[i].light==1)
				{
					html +=
											"<td><img src='/images/light.png' width='70%'><br><br><p>Light</p></td>";
				}
				else{
					html +=
											"<td><img src='/images/dark.png' width='70%'><br><br><p>Dark</p></td>";
				}
				html += 								"<td><img src='/images/hum.png' width='70%'><br><br><p>" +jsonObject[i].humidity + "%</p></td>" +
												"<td><img src='/images/temp.png' width='70%'><br><br><p>" +jsonObject[i].temperature + "°C</p></td>" +
												"<td><img src='/images/soil.png' width='70%'><br><br><p>" +jsonObject[i].moisture + "%</p></td>" +
											"</tr></table></div></div><br><br>";
				if (i==numberObjects -1){
					html+= "<br><br>"
				}
			}
			if (req.user.profile_picture_url!=null){
				profilePicture += "<li role='presentation'><img src='" + req.user.profile_picture_url + "' class='w3-left w3-round-xxlarge w3-margin-right' style='height:3em'></li>"
			}

		}

		res.render('index', {html: html, name: name, profilePicture: profilePicture});


});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;
