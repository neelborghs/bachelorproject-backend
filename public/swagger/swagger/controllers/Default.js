'use strict';

var url = require('url');

var Default = require('./DefaultService');

module.exports.sensorsGET = function sensorsGET (req, res, next) {
  Default.sensorsGET(req.swagger.params, res, next);
};
