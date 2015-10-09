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
var request = require('request');
var _ = require('underscore');
var url = require('url');
var util = require('util');
var localServices = require('./config/local-services');
var serviceMapping = require('./config/service-mapping');
var config = require('./config/config');
var httpException = require('./utils/http-exception');


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

    req.pipe(request({
            url: targetUrl,
            method: req.method,
            timeout: config.get('timeout')
        },
        handleProxyError(res, service.name, path)
    )).pipe(res);
}


function handleProxyError(res, serviceName, path) {
    return function(error) {
        var message;
        if(error) {
            if(error.code === 'ECONNREFUSED') {
                message = util.format("Connection refused to service %s, path %s", serviceName, path);
                httpException.throw(res, 500, "Connection refused", message);
            } else {
                message = util.format('Error while proxying request to service %s, path %s', serviceName, path);
                httpException.throw(res, 500, "Error occured", message, error);
            }
        }
    };
}

function throw404(res, message) {
    httpException.throw(res, 404, "Not Found", message);
}

module.exports = {
    forward: forwardRequest
};
