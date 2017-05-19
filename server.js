'use strict';

const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
const logger = require('morgan');
const routes = require('./routes/api');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
const mongoose = require('mongoose');
var nodemailer = require('nodemailer');

//find appropriate database to connect to
const uristring = process.env.MONGODB_URI;
// set up express app
const app = express();

//serve static files to user from public foler
app.use(express.static('public'));

app.use(bodyParser.json());

//connect to mongodb
mongoose.connect(uristring, function (err, res) {
  if(err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});
mongoose.Promise = global.Promise;


var db = mongoose.connection;
var routers = require('./routes/dashboard');
var users = require('./routes/users');

// Init app


// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'iH&7aFrR6a9q', //Secret mag veranderd worden!!!!
    saveUninitialized: true,
    resave: true
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
//initialize routes
app.use('/api', routes);
app.use('/', routers);
app.use('/users', users);

//error handling
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(422).send({error: err.message});
});

// Set Port
app.set('port', (process.env.PORT || 3000));
// listen for requests
app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
