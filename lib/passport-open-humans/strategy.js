'use strict';

/**
 * Module dependencies.
 */
var debug = require('debug')('passport-open-humans');
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

  options.hostURL = options.hostURL || 'https://www.openhumans.org';

  options.authorizationURL = options.authorizationURL || options.hostURL +
    '/oauth2/authorize/';
  options.tokenURL = options.tokenURL || options.hostURL +
    '/oauth2/token/';

  options.scopeSeparator = options.scopeSeparator || ' ';

  OAuth2Strategy.call(this, options, verify);

  this.name = 'open-humans';
  this.hostURL = options.hostURL;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

function getParams(options) {
  var params = {};

  if (options.origin) {
    if (options.origin === 'open-humans') {
      params.origin = 'open-humans';
    } else {
      params.origin = 'external';
    }
  }

  return params;
}

/**
 * Support the Open Humans origin parameter.
 */
Strategy.prototype.authorizationParams = getParams;
Strategy.prototype.tokenParams = getParams;

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
  this._oauth2.getProtectedResource(this.hostURL + '/api/member/',
    accessToken, function (err, body) {
      debug('userProfile() with accessToken "%s"', accessToken);

      if (err) {
        debug('failed to fetch profile: "%j"', err);

        return done(new InternalOAuthError('failed to fetch user profile', err));
      }

      var profile = {};

      try {
        profile = JSON.parse(body);
      } catch (e) {
        debug('failed to parse body: "%s"', body);

        // pass
      }

      profile.provider = 'open-humans';

      done(null, profile);
    });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
