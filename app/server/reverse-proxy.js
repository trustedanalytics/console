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

const HOST_SUFFIX = "_HOST";

function getHost(service, path) {
    var host = null;

    if(!service) {
        host = localServices[service.name];
        console.info('Using default url for service %s: %s', service.name, host);
        return host;
    }

    if(service.domainRewrite) {
        var domain = config.getDomain();
        var parameters = path.match(service.path);
        var subdomain = parameters[1];
        var endpoint = parameters[2];

        host = "http://" + subdomain + "." + domain;
        if(endpoint) {
            host += (service.endpoint ? service.endpoint : "") + "/" + endpoint;
        }
        return host;
    }

    if(isServiceHostEnvExist(service.name)) {
        return process.env[serviceNameInHostEnvNotation(service.name)];
    }

    var userProvidedService = config.getUserProvidedSerice(service.name);
    return userProvidedService.host;
}

function getServiceName(requestUrl) {
    return _.find(serviceMapping, function(service){
        return requestUrl.match(service.path);
    });
}

function serviceNameInHostEnvNotation(service) {
    return service.toUpperCase().split("-").join("_") + HOST_SUFFIX;
}

function isServiceHostEnvExist(service) {
    return process.env[serviceNameInHostEnvNotation(service)];
}

function forwardRequest(req, res) {
    var path = req.url;
    var service = getServiceName(path);
    if(!service) {
        throw404(res, util.format("No service found for the path: %s", JSON.stringify(path)));
        return;
    }

    var host = getHost(service, path);
    if(!host) {
        throw404(res, util.format("No route found for service  %s", JSON.stringify(service)));
        return;
    }

    var targetUrl = service.domainRewrite ? host : url.resolve(host, path);

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
