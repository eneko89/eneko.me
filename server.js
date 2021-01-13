/*!
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */

// Express, nodemailer and global middleware.
const express = require('express');
const nodemailer = require('nodemailer');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');

// Nodemailer's Gmail transporter with OAuth2 authentication to send mails
// on behalf of <contact@eneko.me> (Google Apps account with custom domain).
const gmTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: 'contact@eneko.me',
    clientId: process.env.GM_CLIENT_ID,
    clientSecret: process.env.GM_CLIENT_SECRET,
    refreshToken: process.env.GM_REFRESH_TOKEN
  }
});

const app = express();

// Sets server port.
app.set('port', process.env.PORT || 3000);

// Use gzip compression.
app.use(compression());

// Logging middleware in the development environment.
// Environment mode (app.get('env') or app.settings.env) defaults to
// process.env.NODE_ENV environmental var ('development' if not set).
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
}

// Parse application/json content-type bodies (populates req.body).
app.use(bodyParser.json());

// Serve built assets (bundled, minified, fingerprinted...) from the /dist
// folder. Try 'npm run dev' to build, start a dev server, load env vars
// from a local .env file and watch for changes while developing.
app.use(express.static('dist'));

// Contact endpoint, sends an e-mail on behalf of <contact@eneko.me>.
app.post('/contact', function(req, res) {
  const isValidMail = email => /^.+@.+\..+$/.test(email);
  if (isValidMail(req.body.email)) {
    gmTransporter.sendMail({
      from: 'contact@eneko.me',
      to: 'contact@eneko.me',
      subject: '[eneko.me] [' + req.body.name + ', ' + req.body.email + ']',
      text: req.body.text
    }, function(error) {
      if (error) {
        console.log(error);
        res.status(500).send({ error: 'Something blew up...' });
      } else {
        res.send();
      }
    });
  } else {
    res.status(400).send({ error: 'Wrong e-mail address.' });
  }
});

// Reply with a 404 if nothing previously matches.
app.use(function(req, res) {
  res.status(404).send('Not found!');
});

// Start the HTTP server.
app.listen(app.get('port'), function() {
  console.log('HTTP server listening on port ' + app.get('port'));
});
