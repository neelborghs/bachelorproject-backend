'use strict';

exports.historyGET = function(args, res, next) {
  /**
   * User Activity
   * The User Activity endpoint returns data about a user's lifetime activity with Uber. The response will include pickup locations and times, dropoff locations and times, the distance of past requests, and information about which products were requested.<br><br>The history array in the response will have a maximum length based on the limit parameter. The response value count may exceed limit, therefore subsequent API requests may be necessary.
   *
   * offset Integer Offset the list of returned results by this amount. Default is zero. (optional)
   * limit Integer Number of items to retrieve. Default is 5, maximum is 100. (optional)
   * returns Activities
   **/
  var examples = {};
  examples['application/json'] = {
  "offset" : 123,
  "limit" : 123,
  "count" : 123,
  "history" : [ {
    "uuid" : "aeiou"
  } ]
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

exports.meGET = function(args, res, next) {
  /**
   * User Profile
   * The User Profile endpoint returns information about the Uber user that has authorized with the application.
   *
   * returns Profile
   **/
  var examples = {};
  examples['application/json'] = {
  "last_name" : "aeiou",
  "promo_code" : "aeiou",
  "first_name" : "aeiou",
  "email" : "aeiou",
  "picture" : "aeiou"
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

