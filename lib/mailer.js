var express = require('express')
  , rateLimiter = require('connect-ratelimit')
  , nodemailer = require('nodemailer');

module.exports = function(config) {

  if (!config.from)
    throw "Mailer must be given a `from` address";
  if (!config.allowedDestinations)
    throw "Mailer must be given a list of `allowedDestinations`";
  if (!config.transport)
    throw "Mailer must be given a nodemailer transport as `mailTransport`"

  var app = express();

  // Don't send the x-powered-by header
  app.disable('x-powered-by');

  // Rate-limit the number of e-mails any individual can send
  if (config.rateLimits) {
    app.use(rateLimiter({
      categories: {
        normal: config.rateLimits
      }
    }));
  }

  // Limit HTTP request size to 10kb to stop massive e-mails
  if (config.maxRequestSize) {
    app.use(express.limit(config.maxRequestSize));
  }

  // Set up a nodemailer transport with the given settings
  var mailTransport = nodemailer.createTransport("SMTP", config.transport);

  // Parse the request body as JSON and add to the request object
  app.use(express.json({strict: true}));

  // Set up the mailer on POST /
  app.post('/', function(req, res) {
    var to = req.body.to
      , subject = req.body.subject;

    // Remove to/subject from the body, as we don't want them to be part of
    // the e-mail's body.
    delete req.body.to;
    delete req.body.subject;

    // Send error messages if there are any issues with the request. Send a
    // code as well so the client can construct error messages in another
    // language if necessary.
    if (!to) {
      res.send(400, {
        code: 1,
        error: "I don't know who to send your e-mail to?"
      });
    } else if (config.allowedDestinations.indexOf(to) == -1) {
      res.send(403, {
        code: 2,
        error: "That person isn't allowed to receive e-mails :("
      });
    }

    if (!subject) {
      res.send(400, {
        code: 3,
        error: "You need to give the e-mail a subject."
      });
    }

    // Construct a HTML e-mail from the remaining fields in req.body
    var fields = [];
    for (itemName in req.body) {
      fields.push("<p><strong>"+itemName+":</strong> <br />"+req.body[itemName]+"</p>");
    }

    if (fields.length == 0) {
      res.send(400, {
        code: 4,
        error: "Please don't send us blank e-mails!"
      })
    }

    var html = fields.join("\n");

    // Send the e-mail
    mailTransport.sendMail({
      from: config.from,
      to: to,
      subject: subject,
      html: html
    }, function(error, mailResponse) {
      if (error) {
        res.send(500, {
          code: 5,
          error: "Something, somewhere went horribly wrong, and as a result we couldn't send your e-mail. Maybe try again later?"
        });
      } else {
        res.send({sent: true});
      }
    });
  });

  return app;
};