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
var request = require('request'),
    _ = require('underscore'),
    url = require('url'),
    util = require('util'),

    localServices = require('./config/local-services'),
    serviceMapping = require('./config/service-mapping'),
    config = require('./config/config'),
    httpException = require('./utils/http-exception'),
    gatewayErrors = require('./gateway-errors');


function getHost(serviceName) {
    var service = config.getUserProvidedSerice(serviceName);
    var host = null;
    if(service) {
        host = service.host;
    } else {
        host = localServices[serviceName];
        console.info('Using default url for service %s: %s', serviceName, host);
    }
    return host;
}

function getServiceName(requestUrl) {
    return _.find(serviceMapping, function(service){
        return requestUrl.match(service.path);
    });
}

function forwardRequest(req, res) {
    var path = req.url;
    var service = getServiceName(path);
    if(!service) {
        throw404(res, util.format("No service found for the path: %s", JSON.stringify(path)));
        return;
    }

    var host = getHost(service.name);
    if(!host) {
        throw404(res, util.format("No route found for service  %s", JSON.stringify(service)));
        return;
    }

    var targetUrl = url.resolve(host, path);

    if(req.user && req.user.accessToken) {
        req.headers['Authorization'] = 'bearer ' + req.user.accessToken;
    }
    req.headers['x-forwarded-host'] = req.headers['host'];

    var timeout = service.timeout || config.get('timeout');

    req.clearTimeout();

    req.pipe(request({
            url: targetUrl,
            method: req.method,
            timeout: timeout
        },
        handleProxyError(res, service.name, path)
    )).pipe(res);
}


function handleProxyError(res, serviceName, path) {
    return function(httpError) {
        if(!httpError) {
            return;
        }

        var error = gatewayErrors.getError(httpError.code);
        httpException.throw(res, error.code, error.title, util.format(error.description, serviceName, path), httpError);
    };
}

function throw404(res, message) {
    httpException.throw(res, 404, "Not Found", message);
}

module.exports = {
    forward: forwardRequest
};
