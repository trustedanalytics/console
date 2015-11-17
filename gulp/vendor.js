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

    gulpsync    = require('gulp-sync')(gulp),
    plugins     = require('gulp-load-plugins')(),
    config      = require('./config');
// @formatter:on


gulp.task('vendor', gulpsync.sync(['vendor:bower', 'vendor:compile']));


gulp.task('vendor:compile', ['vendor:base:scripts', 'vendor:base:styles', 'vendor:app']);


gulp.task('vendor:bower', function(){
    return plugins.bower();
});

gulp.task('vendor:base:scripts', function () {
    return utils.compileScripts(config.js.vendorBase);
});

gulp.task('vendor:base:styles', function () {
    return utils.compileCss(config.styles.vendorBase);
});

// copy file from bower folder into the app vendor folder
gulp.task('vendor:app', function () {

    var jsFilter = plugins.filter('**/*.js', {restore: true});
    var cssFilter = plugins.filter('**/*.css', {restore: true});
    var taskConfig = config.vendor;

    return gulp.src(utils.getSrc(taskConfig), { base: utils.getBase(taskConfig) })
        .pipe(plugins.plumber())
        .pipe(jsFilter)
        .pipe(plugins.uglify())
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(plugins.minifyCss({ rebase: false }))
        .pipe(cssFilter.restore)
        .pipe(gulp.dest(utils.getDest(taskConfig)));

});
