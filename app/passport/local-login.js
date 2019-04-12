// @ts-check

/*
    SPDX-License-Identifier: Apache-2.0
*/

const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const PassportLocalStrategy = require('passport-local').Strategy;

const User = require('../platform/fabric/models/User');

const config = require('../explorerconfig.json');

const jwtSignAsync = promisify(jwt.sign);

const strategy = function(platform) {
  const proxy = platform.getProxy();
  return new PassportLocalStrategy(
    {
      usernameField: 'user',
      passwordField: 'password',
      session: false,
      passReqToCallback: true
    },
    async (req, user, password, done) => {
      const userData = {
        user: user.trim(),
        password: password.trim()
      };

      const reqUser = await new User(req.body).asJson();
      const userInfo = await proxy.authenticate(reqUser);

      const payload = {
        sub: userInfo.user
      };

      const token = await jwtSignAsync(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      const data = {
        message: 'logged in',
        name: userData.user
      };

      return done(null, token, data);
    }
  );
};

/**
 * Return the Passport Local Strategy object.
 */
module.exports = strategy;
