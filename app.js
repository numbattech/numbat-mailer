var express = require('express')
  , mailer = require ('./lib/mailer');

var config = require('./config.json');

var app = express();

// Don't send the x-powered-by header
app.disable('x-powered-by');

// Make our mailer respond to '/send'
app.use('/send', mailer(config));

// Turn on the web server, using port from environment variables if set
app.listen(process.env.PORT || 3000);

