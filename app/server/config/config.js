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
var _ = require('underscore');
var defaults = require('./default-config.json');

var vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}');
var vcapApplication = JSON.parse(process.env.VCAP_APPLICATION || '{}');
var userProvided = vcapServices['user-provided'] || [];
var ssoEnvList = _.keys(process.env).filter(function(vcapServiceName) {
    return vcapServiceName.indexOf('SSO_') === 0;
});

function getUserProvidedSerice(name) {
    var service = _.findWhere(userProvided, { name: name });
    return service && service.credentials;
}

function getDomain() {
    var domain = getVariable('domain');
    if(domain) {
        return domain;
    }

    if (vcapApplication.uris) {
        return vcapApplication.uris[0].split(".").slice(1).join(".");
    }

    throw new Error('Cannot fetch domain configuration');
}

function getVariable(name) {
    if(!name || !_.isString(name)) {
        return null;
    }
    var value = process.env[name.toUpperCase()];
    if(!value) {
        value = defaults[name.toLowerCase()];
    }
    return value;
}

function getSso() {
    var sso = getUserProvidedSerice('sso') || {};
    ssoEnvList.forEach(function(env){
        if(process.env[env]) {
            var userProvidedName = envNameToUserProvidedName(env);
            sso[userProvidedName] = process.env[env];
        }
    });
    return sso;
}

function envNameToUserProvidedName(env) {
    var envNameWithoutUnderscores = env.split('_').
        slice(1).
        forEach(function(splitEnv) {
            splitEnv = capitalize(splitEnv);
        }).
        join('');
    return envNameWithoutUnderscores.concat(envNameWithoutUnderscores[0].toLowerCase(), envNameWithoutUnderscores.substr(1));
}

function capitalize(input) {
    return input[0].toUpperCase() + input.substr(1).toLowerCase();
}

module.exports = {
    getUserProvidedSerice: getUserProvidedSerice,
    getDomain: getDomain,
    getSso: getSso,
    get: getVariable
};
