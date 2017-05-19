'use strict';

exports.estimatesPriceGET = function(args, res, next) {
  /**
   * Price Estimates
   * The Price Estimates endpoint returns an estimated price range for each product offered at a given location. The price estimate is provided as a formatted string with the full price range and the localized currency symbol.<br><br>The response also includes low and high estimates, and the [ISO 4217](http://en.wikipedia.org/wiki/ISO_4217) currency code for situations requiring currency conversion. When surge is active for a particular product, its surge_multiplier will be greater than 1, but the price estimate already factors in this multiplier. 
   *
   * start_latitude Double Latitude component of start location.
   * start_longitude Double Longitude component of start location.
   * end_latitude Double Latitude component of end location.
   * end_longitude Double Longitude component of end location.
   * returns List
   **/
  var examples = {};
  examples['application/json'] = [ {
  "high_estimate" : 1.3579000000000001069366817318950779736042022705078125,
  "product_id" : "aeiou",
  "low_estimate" : 1.3579000000000001069366817318950779736042022705078125,
  "surge_multiplier" : 1.3579000000000001069366817318950779736042022705078125,
  "estimate" : "aeiou",
  "display_name" : "aeiou",
  "currency_code" : "aeiou"
} ];
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

exports.estimatesTimeGET = function(args, res, next) {
  /**
   * Time Estimates
   * The Time Estimates endpoint returns ETAs for all products offered at a given location, with the responses expressed as integers in seconds. We recommend that this endpoint be called every minute to provide the most accurate, up-to-date ETAs.
   *
   * start_latitude Double Latitude component of start location.
   * start_longitude Double Longitude component of start location.
   * customer_uuid UUID Unique customer identifier to be used for experience customization. (optional)
   * product_id String Unique identifier representing a specific product for a given latitude & longitude. (optional)
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

