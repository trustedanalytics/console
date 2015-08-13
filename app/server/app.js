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
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');

var auth = require('./auth/auth');
var reverseProxy = require('./reverse-proxy');

var app = express();

var baseDir = path.join(__dirname, '../..');
var staticFilesDir = path.join(baseDir, 'target/app/ui');


app.use(logger('dev'));
app.use(cookieParser());

app.use(favicon(path.join(staticFilesDir, 'app/img/favicon.png')));

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



app.route('/rest/*')
    .get(
        auth.checkLoggedIn,
        reverseProxy.forward
    )
    .put(
        auth.checkLoggedIn,
        reverseProxy.forward
    )
    .post(
        auth.checkLoggedIn,
        reverseProxy.forward
    )
    .delete(
        auth.checkLoggedIn,
        reverseProxy.forward
    );

app.get('/files/*',
        auth.checkLoggedIn,
        reverseProxy.forward);


app.get('/',
    auth.login,
    express.static(staticFilesDir)
);

app.get('/**',
    auth.checkLoggedIn,
    express.static(staticFilesDir)
);


module.exports = app;
