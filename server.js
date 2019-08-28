var express = require('express'),
  mongoose = require('mongoose'),
  config = require('./config'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  sessions = require("client-sessions"),
  dogRouter = require("./routes/dogRoutes.js"),
  authRouter = require("./routes/authRoutes.js");

  var app = express();

  app.listen((process.env.PORT || config.port), function() {
    console.log('App listening on port', (process.env.PORT || config.port));
  });

  var options = {
    user: config.db.username,
    pass: config.db.password,
    useNewUrlParser: true,
    useCreateIndex: true
  };

  mongoose.connect(config.db.uri, options, function (err) {
    if (err)
      console.log(err);
    else
      console.log("Successful connection to MongoDB!");
  });

  app.use(sessions({
    cookieName: 'session',
    secret: 'abhikeks1026',
    duration: 1000 * 60 * 30,
    activeDuration: 1000 * 60 * 5
  }));

  app.use(morgan('dev'));

  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(bodyParser.json());

  app.use('/api/dogs', dogRouter);
  app.use('/api/auth', authRouter);
