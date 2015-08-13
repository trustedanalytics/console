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
// @formatter:off
var gulp        = require('gulp'),
    config      = require('./config'),
    utils      = require('./utils'),

    plugins     = require('gulp-load-plugins')();
// @formatter:on


gulp.task('new-account:scripts', function () {
    return utils.compileScripts(config.js.newAccount);
});


gulp.task('new-account:styles', function () {
    return utils.compileStyles(config.styles.newAccount);
});


gulp.task('new-account:templates', function () {
    return utils.compileTemplates(config.templates.newAccount);
});


// IMG
gulp.task('new-account:static', function () {
    return utils.copyStatic(config.static.newAccount);
});

//---------------
// WATCH
//---------------

// Rerun the task when a file changes
gulp.task('new-account:watch', function () {

    gulp.watch(utils.getSrc(config.js.newAccount), ['new-account:scripts']);
    gulp.watch(utils.getSrc(config.templates.newAccount), ['new-account:templates']);
    gulp.watch(utils.getSrc(config.static.newAccount), ['new-account:static']);
    gulp.watch(utils.appendSrc(config.styles.newAccount.watch), ['new-account:styles']);
});


// default (no minify)
gulp.task('new-account', [
    'new-account:scripts',
    'new-account:styles',
    'new-account:templates',
    'new-account:static',
], function () {

    plugins.util.log(plugins.util.colors.cyan('************'));
    plugins.util.log(plugins.util.colors.cyan('* New account compiled *'));
    plugins.util.log(plugins.util.colors.cyan('************'));

});
