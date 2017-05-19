const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create sensor Schema & model
const SensorSchema = new Schema({
  user_id: String,
  module_id: String,
  temperature: String,
  light: String,
  humidity: String,
  moisture: String,
  datetime: String
},
{
  versionKey: false
});

const Sensor = mongoose.model('sensor', SensorSchema);
module.exports = Sensor;
