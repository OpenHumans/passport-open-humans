'use strict';

/**
 * Module dependencies.
 */
var util = require('util');

var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The Open Humans authentication strategy authenticates requests by delegating
 * to Open Humans using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Open Humans application's App ID
 *   - `clientSecret`  your Open Humans application's App Secret
 *   - `callbackURL`   URL to which Open Humans will redirect the user after
 *                     granting authorization
 *
 * Examples:
 *
 *     passport.use(new OpenHumansStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/open-humans/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};

  options.hostURL = options.hostURL || 'https://openhumans.org';

  options.authorizationURL = options.authorizationURL || options.hostURL +
    '/oauth2/authorize';
  options.tokenURL = options.tokenURL || options.hostURL +
    '/oauth2/access_token';

  options.scopeSeparator = options.scopeSeparator || ' ';

  OAuth2Strategy.call(this, options, verify);

  this.name = 'open-humans';
  this.hostURL = options.hostURL;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Open Humans.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `open-humans`
 *   - `id`               the user's Open Humans ID
 *   - `username`         the user's Open Humans username (same as their ID)
 *   - `displayName`      the user's full name
 *   - `profileUrl`       the URL of the profile for the user on Open Humans
 *   - `emails`           the proxied or contact email address
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.getProtectedResource(this.hostURL + '/api/profile/current/',
    accessToken, function (err, body) {
    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }

    try {
      var json = JSON.parse(body);

      var profile = {
        provider: 'open-humans',
        id: json.id,
        username: json.username,
        profileUrl: json.url
      };

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch (e) {
      done(e);
    }
  });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
