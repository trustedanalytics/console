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
var url = require('url');
var proxyAgents = {
    'http': require('http-proxy-agent'),
    'https': require('https-proxy-agent')
};
var httpObjects = {
    'http': require('http'),
    'https': require('https')
};

function injectProxy(httpObject, agent) {
    var originalRequest = httpObject.request;
    httpObject.request = function(options, callback) {
        options = _.isString(options) ? url.parse(options) : options;
        _.defaults(options, {
            agent: agent
        });
        return originalRequest(options, callback);
    };
}

function initProxyForProtocol(schema) {
    var proxyValue = process.env[schema + '_proxy'];
    if(proxyValue) {
        injectProxy(httpObjects[schema], new proxyAgents[schema](proxyValue));
        console.info("Using proxy %s for protocol %s", proxyValue, schema);
    }
}

function initProxy() {
    initProxyForProtocol('http');
    initProxyForProtocol('https');
}

module.exports = {
    init: initProxy
};
