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
var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    favicon = require('serve-favicon'),
    compression = require('compression'),
    timeout = require('connect-timeout'),

    auth = require('./auth/auth'),
    reverseProxy = require('./reverse-proxy'),
    config = require('./config/config');

var app = express();

var baseDir = path.join(__dirname, '../..');
var staticFilesDir = path.join(baseDir, 'target/app/ui');


app.use(logger('dev'));
app.use(timeout(config.get('timeout')));
app.use(cookieParser());
app.use(timeoutHandler);
app.use(compression());
app.use(favicon(path.join(staticFilesDir, 'app/img/favicon.png')));
app.disable('x-powered-by');

auth.init(app);

app.get('/new-account',
    function(req, res) {
        res.sendFile(path.join(staticFilesDir, 'new-account/new-account.html'));
    }
);

app.get('/new-account/*',
    express.static(staticFilesDir)
);

app.get('/rest/registrations/*',
    reverseProxy.forward);

app.post('/rest/registrations',
    reverseProxy.forward);

app.get('/rest/config/uploader', auth.checkLoggedIn,
    function(req, res) {
        res.send(config.get("UPLOADER_CONFIG"));
    }
);

app.all('/rest/*',
    auth.checkLoggedIn,
    reverseProxy.forward
);

app.get('/files/*',
    auth.checkLoggedIn,
    reverseProxy.forward
);

app.get('/',
    auth.login,
    express.static(staticFilesDir)
);

app.get('/**',
    auth.checkLoggedIn,
    express.static(staticFilesDir)
);

app.use(timeoutHandler);


function timeoutHandler(err, req, res, next){
    if (req.timedout) {
        console.error("Server timeout", err);
        res.status(503);
        res.send("Server timeout");
        return;
    }
    next();
}

module.exports = app;
