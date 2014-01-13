numbat-mailer
=============

Express app to forward messages to any allowed address

## Project Layout

- `mailer.js` - Holds a mountable express app for sending e-mail.
- `app.js` - A simple express app which mounts `mailer.js`, in case you don't have a pre-existing one.

## Development

First, install dependencies with:

```
npm install
```

You can use the default `app.js` with nodemon, so the server will be automatically restarted when any of the javascript files are modified. Install it globally if you haven't already:

```
npm install nodemon -g
```

Then start the server with nodemon, just run `nodemon app.js`.