'use strict';

const express = require('express');
const path = require('path');
const router = express.Router();
const Sensor = require('../models/sensors');

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const register = require('../functions/register');
const login = require('../functions/login');
const profile = require('../functions/profile');
const password = require('../functions/password');
const mymodule = require('../functions/mymodule');
const config = require('../config/config.json');

var async = require('async');

//------------------------------------------------------------------------------
//Specific user information
//------------------------------------------------------------------------------

//sensor values from user
router.get('/modules/user/:id', function(req, res) {
  var userId = req.params.id;
  async.waterfall([
    getModuleIDs => {
      Sensor.find({user_id: userId}).distinct('module_id', (error, moduleIds) => {
        getModuleIDs(null, moduleIds);
      })
    },
    (IDs, getLatestModule) => {
      var temp = [];
      for(var i=0; i<IDs.length; i++) {
        if(i == IDs.length - 1) {
          Sensor.find({user_id: userId, module_id: IDs[i]}).sort({_id: -1}).limit(1).then(latestModule => {
            temp = temp.concat(latestModule);
            getLatestModule(null, temp)
          });
        } else {
          Sensor.find({user_id: userId, module_id: IDs[i]}).sort({_id: -1}).limit(1).then(latestModule => {
            temp = temp.concat(latestModule);
          });
        }
      }
    }
  ],
  function(err, response) {
    res.send(response);
  });
})

//profile picture from user
router.put('/android/profileimage', function(req, res) {
  const email = req.body.email;
  const newUrl = req.body.profile_picture_url;
  if(!newUrl || !newUrl.trim()) {
    res.status(400).json({ message: 'Invalid image url request !' });
  } else {
    profile.editProfileUrl(email, newUrl)

    .then(result => res.status(result.status).json({ message: result.message }))

		.catch(err => res.status(err.status).json({ message: err.message }));
  }
});

router.put('/android/connect', function(req, res) {
  const email = req.body.email;
  const userId = req.body.user_id;
  if(!userId || !userId.trim()) {
    res.status(400).json({ message: 'Invalid request !' });
  } else {
    profile.setUserId(email, userId)

    .then(result => res.status(result.status).json({ message: result.message }))

		.catch(err => res.status(err.status).json({ message: err.message }));
  }
})

//------------------------------------------------------------------------------
//user authentication
//------------------------------------------------------------------------------

router.post('/authenticate', function(req, res) {
  const credentials = auth(req);

  if (!credentials) {
			res.status(400).json({ message: 'Invalid Request !' });
		} else {
			login.loginUser(credentials.name, credentials.pass)

			.then(result => {
				const token = jwt.sign(result, config.secret);
				res.status(result.status).json({ message: result.message, token: token });
			})

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
});

router.post('/users', function(req, res) {
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
	const email = req.body.email;
	const password = req.body.password;

	if (!firstName || !lastName || !email || !password || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
		res.status(400).json({message: 'Invalid Request !'});
	} else {
		register.registerUser(firstName, lastName, email, password)

		.then(result => {
			res.setHeader('Location', '/users/'+email);
			res.status(result.status).json({ message: result.message })
		})

		.catch(err => res.status(err.status).json({ message: err.message }));
	}
});

router.get('/users/:id', function(req, res) {
  if (checkToken(req)) {
		profile.getProfile(req.params.id)

		.then(result => res.json(result))

		.catch(err => res.status(err.status).json({ message: err.message }));

	} else {
		res.status(401).json({ message: 'Invalid Token !' });
	}
});

router.put('/users/:id', function(req, res) {
  if (checkToken(req)) {
		const oldPassword = req.body.password;
		const newPassword = req.body.newPassword;

		if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {
			res.status(400).json({ message: 'Invalid Request !' });
		} else {
			password.changePassword(req.params.id, oldPassword, newPassword)

			.then(result => res.status(result.status).json({ message: result.message }))

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	} else {
		res.status(401).json({ message: 'Invalid Token !' });
	}
});

router.post('/users/:id/password', function(req, res) {
  const email = req.params.id;
	const token = req.body.token;
	const newPassword = req.body.password;

	if (!token || !newPassword || !token.trim() || !newPassword.trim()) {
		password.resetPasswordInit(email)

		.then(result => res.status(result.status).json({ message: result.message }))

		.catch(err => res.status(err.status).json({ message: err.message }));
	} else {
		password.resetPasswordFinish(email, token, newPassword)

		.then(result => res.status(result.status).json({ message: result.message }))

		.catch(err => res.status(err.status).json({ message: err.message }));
	}
});

function checkToken(req) {
	const token = req.headers['x-access-token'];
	if (token) {
		try {
  		var decoded = jwt.verify(token, config.secret);
  		return decoded.message === req.params.id;
		} catch(err) {
			return false;
		}
	} else {
		return false;
	}
}

//------------------------------------------------------------------------------
//General API functions
//------------------------------------------------------------------------------

//add new module information
router.post('/sensors', function(req, res, next) {
  const userId = req.body.user_id;
  const moduleId = req.body.module_id;
  const temperature = req.body.temperature;
  const light = req.body.light;
  const humidity = req.body.humidity;
  const moisture = req.body.moisture;

  mymodule.addModule(userId, moduleId, temperature, light, humidity, moisture)

  .then(result => res.status(result.status).json({ message: result.message }))

  .catch(err => res.status(err.status).json({ message: err.message }));
})

//get all sensor data
router.get('/sensors', function(req, res, next) {
  if (req.originalUrl != "/api/sensors") { next(); };
  Sensor.find({}, {'_id': false}).then(function(allSensors) {
    res.send(allSensors);
  })
});

//get sensor data from user_id
router.get('/sensors', function(req, res, next) {
  if (!req.query.user_id) { next(); };
  Sensor.find({user_id: req.query.user_id}, {'_id': false}).then(function(sensors) {
    res.send(sensors);
  });
});

//get sensor data from module_id
router.get('/sensors', function(req, res, next) {
  if (!req.query.module_id) { next(); };
  Sensor.find({module_id: req.query.module_id}, {'_id': false}).then(function(sensors) {
    res.send(sensors);
  });
});

//get sensor data from datetime
router.get('/sensors', function(req, res, next) {
  if (!req.query.datetime) { next(); };
  Sensor.find({datetime: req.query.datetime}, {'_id': false}).then(function(sensors) {
    res.send(sensors);
  });
});

//get sensor data from sensor data: temperature
router.get('/sensors', function(req, res, next) {
  if (!req.query.temperature) { next(); };
  Sensor.find({temperature: req.query.temperature}, {'_id': false}).then(function(sensors) {
    res.send(sensors);
  });
});

//get sensor data from sensor data: light
router.get('/sensors', function(req, res, next) {
  if (!req.query.light) { next(); };
  Sensor.find({light: req.query.light}, {'_id': false}).then(function(sensors) {
    res.send(sensors);
  });
});

//get sensor data from sensor data: humidity
router.get('/sensors', function(req, res, next) {
  if (!req.query.humidity) { next(); };
  Sensor.find({humidity: req.query.humidity}, {'_id': false}).then(function(sensors) {
    res.send(sensors);
  });
});

//get sensor data from sensor data: moisture
router.get('/sensors', function(req, res, next) {
  if (!req.query.moisture) { next(); };
  Sensor.find({moisture: req.query.moisture}, {'_id': false}).then(function(sensors) {
    res.send(sensors);
  });
});

//update sensor data in database
router.put('/sensors/:id', function(req, res, next) {
  Sensor.findByIdAndUpdate({_id: req.params.id}, req.body).then(function() {
    //we send back the updated sensor data as a response
    Sensor.findOne({_id: req.params.id}).then(function(sensor) {
      res.send(sensor);
    });
  });
});

//delete sensor data from database
router.delete('/sensors/:id', function(req, res, next) {
  Sensor.findByIdAndRemove({_id: req.params.id}).then(function(sensor) {
    res.send(sensor);
  });
});


/*router.get('/android/users/:id', function(req, res) {
  Sensor.find({user_id: req.params.id}) //, {'_id': false}
  .then(result => res.json(result))

  .catch(err => res.status(err.status).json({ message: err.message}));
});

router.get('/android/test/:id', function(req, res) {
  var userId = req.params.id;
  async.waterfall([
    getModuleIDs => {
      Sensor.find({user_id: userId}).distinct('module_id', (error, moduleIds) => {
        getModuleIDs(null, moduleIds);
      })
    },
    (IDs, getLatestModule) => {
      var temp = [];
      for(var i=0; i<IDs.length; i++) {
        if(i == IDs.length - 1) {
          Sensor.find({user_id: userId, module_id: IDs[i]}).sort({_id: -1}).limit(1).then(latestModule => {
            temp = temp.concat(latestModule);
            getLatestModule(null, temp)
          });
        } else {
          Sensor.find({user_id: userId, module_id: IDs[i]}).sort({_id: -1}).limit(1).then(latestModule => {
            temp = temp.concat(latestModule);
          });
        }
      }
    }
  ],
  function(err, response) {
    //console.log(response);
    res.send(response);
  });
})

//https://stackoverflow.com/questions/41743924/how-can-run-mongoose-query-in-foreach-loop
/*
router.get('/android/test/:id', function(req, res) {
  const userId = req.params.id;
  Sensor.find({user_id: userId}).distinct('module_id', function(error, moduleIds) {
    var temp = [];
    moduleIds.forEach(function(id) {
      Sensor.find({user_id: userId, module_id: id}).sort({_id: -1}).limit(1).then(function(latestModule) {
        temp.push(latestModule);
        return Promise.all(temp);
      }).then(function(allModules) {
        console.log("2: " + allModules);
        res.send(allModules);
      })
    })
    //res.send(moduleIds);
  })
});
*/

module.exports = router;
