/**
 * Copyright (c) 2015 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var passport = require('passport'),
    OAuth2Strategy = require('passport-oauth2').Strategy,
    config = require('../config/config');

var sso = config.getSso();

var customHeaders = {
    'Authorization': 'Basic ' + new Buffer(sso.clientId + ':' + sso.clientSecret).toString('base64')
};

var strategy = new OAuth2Strategy({
    authorizationURL: sso.authorizationUri,
    tokenURL: sso.tokenUri,
    clientID: sso.clientId,
    clientSecret: sso.clientSecret,
    callbackURL: '/oauth/callback',
    customHeaders: customHeaders
}, function (accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    done(null, profile);
});

passport.use(strategy);

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

module.exports = {
    passport: passport,
    strategy: strategy
};
