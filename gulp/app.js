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
    utils       = require('./utils'),

    plugins     = require('gulp-load-plugins')(),
    config      = require('./config');
// @formatter:on



gulp.task('app:scripts', function () {
    return utils.compileScripts(config.js.app);
});


gulp.task('app:styles', function () {
    return utils.compileStyles(config.styles.app);
});

//---------------
// TEMPLATES
//---------------

gulp.task('app:templates', function () {
    return utils.compileTemplates(config.templates.app);
});

gulp.task('app:views', function () {
    return utils.compileTemplates(config.templates.views);
});


//---------------
// WATCH
//---------------

// Rerun the task when a file changes
gulp.task('app:watch', function () {
    gulp.watch(utils.getSrc(config.js.app), ['app:scripts']);
    gulp.watch(utils.getSrc(config.templates.views), ['app:views']);
    gulp.watch(utils.getSrc(config.templates.app), ['app:templates']);
    gulp.watch(utils.appendSrc(config.styles.app.watch), ['app:styles']);
});


// default (no minify)
gulp.task('app', [

    'app:scripts',
    'app:styles',
    'app:templates',
    'app:views',

], function () {

    plugins.util.log(plugins.util.colors.cyan('************'));
    plugins.util.log(plugins.util.colors.cyan('* App compiled *'));
    plugins.util.log(plugins.util.colors.cyan('************'));

});