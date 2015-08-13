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
    del         = require('del'),
    path        = require('path'),
    gulpsync    = require('gulp-sync')(gulp),
    utils       = require('./utils'),

    plugins     = require('gulp-load-plugins')(),
    config      = require('./config');
// @formatter:on


gulp.task('clean', function (callback) {
    del(config.destDir, {
        force: true
    }, callback);
});

gulp.task('test', gulpsync.sync(['test:server', 'test:ui']));

gulp.task('test:server', function() {
    return gulp.src('test/javascript/server/**/*.js')
        .pipe(plugins.mocha());
});

gulp.task('test:ui', function() {
    return gulp.src([])
        .pipe(plugins.plumber())
        .pipe(plugins.karma({
            configFile: path.join(config.testsDir, 'karma.conf.js'),
            action: 'run'
        }));
});


gulp.task('lint', function() {
    return gulp.src('app/**/*.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.jshint.reporter('fail'));
});


gulp.task('static', function () {
    return utils.copyStatic(config.static.common);
});


gulp.task('common:watch', function() {
    gulp.watch(utils.getSrc(config.static.common), ['static']);
});
