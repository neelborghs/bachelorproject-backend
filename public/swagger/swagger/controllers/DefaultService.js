'use strict';

exports.sensorsGET = function(args, res, next) {
  /**
   * Product Types
   * The endpoint returns information about the EZgreen products. It's possible to filter on different parameters. 
   *
   * datetime String Unique customer identifier to be used for experience customization. (optional)
   * returns List
   **/
  var examples = {};
  examples['application/json'] = [ {
  "datetime" : "aeiou",
  "module_id" : "aeiou",
  "user_id" : "aeiou",
  "light" : "aeiou",
  "temperature" : "aeiou",
  "humidity" : "aeiou",
  "moisture" : "aeiou"
} ];
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

