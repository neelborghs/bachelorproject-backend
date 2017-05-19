'use strict';

const sensor = require('../models/sensors');

exports.addModule = (userId, moduleId, temperature, light, humidity, moisture) =>

  new Promise((resolve, reject) => {
    const newModule = new sensor({
      user_id: userId,
      module_id: moduleId,
      temperature: temperature,
      light: light,
      humidity: humidity,
      moisture: moisture,
      datetime: new Date()
    });

    newModule.save()

    .then(() => resolve({ status: 201, message: 'User Registered Sucessfully !' }))

		.catch(() =>  reject({ status: 500, message: 'Internal Server Error !' }));

  });

/*exports.findLatest = (userId, moduleId) =>
  new Promise((resolve, reject) => {
    sensor.find({user_id: userId, module_id: module_id}).sort({_id: -1}).limit(1)
    .then(modules => {
      return modules[0];
    })

    .catch(err => reject({ status: 500, message: 'Internal Server Error !' }));
  })*/

/*  exports.findLatest = function(moduleID, callback){
  		var query = {module_id: moduleID};
  		sensor.find(query, callback);
  	}*/
