# Passport-Open Humans

[Passport](http://passportjs.org/) strategy for authenticating with
[Open Humans](https://openhumans.org/) using the OAuth 2.0 API.

This module lets you authenticate using Open Humans in your Node.js
applications.  By plugging into Passport, Open Humans authentication can be
easily and unobtrusively integrated into any application or framework that
supports [Connect](http://www.senchalabs.org/connect/)-style middleware,
including [Express](http://expressjs.com/).

## Installation

```sh
$ npm install --save passport-open-humans
```

## Usage

#### Configure Strategy

The Open Humans authentication strategy authenticates users using a Open Humans
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a app ID, app secret, and callback URL.

```js
passport.use(new OpenHumansStrategy({
    clientID: OPEN_HUMANS_APP_ID,
    clientSecret: OPEN_HUMANS_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/open-humans/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ openHumansId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'open-humans'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/open-humans/callback', passport.authenticate('open-humans', {
  failureRedirect: '/login',
  successReturnToOrRedirect: '/'
}));

app.get('/auth/open-humans', passport.authenticate('open-humans'));
```
