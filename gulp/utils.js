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
var gulp        = require('gulp'),
    path        = require('path'),
    _           = require('underscore'),
    bowerFiles     = require('main-bower-files'),

    plugins     = require('gulp-load-plugins')(),
    config      = require('./config');


module.exports = {
    appendSrc: function (paths) {
        return _.isArray(paths) ? paths.map(this.appendSrc) : path.join(config.srcDir, paths);
    },

    getSrc: function(taskConfig) {
        return this.appendSrc(taskConfig.src);
    },

    getBase: function(taskConfig) {
        var base = taskConfig.base ? path.join(config.srcDir, taskConfig.base) : config.srcDir;
        return base !== '.' ? base : '';
    },

    getDest: function(taskConfig) {
        return taskConfig.dest ? path.join(config.destDir, taskConfig.dest) : config.destDir;
    },

    compileScripts: function(taskConfig) {
        return gulp.src(this.getSrc(taskConfig), { base: this.getBase(taskConfig) })
            .pipe(plugins.filter('**/*.js'))
            .pipe(plugins.concat(taskConfig.dest))
            .pipe(plugins.ngAnnotate())
            .pipe(config.isProduction ? plugins.uglify({preserveComments: 'some'}) : plugins.util.noop())
            .pipe(gulp.dest(config.destDir));
    },

    compileStyles: function(taskConfig) {
        return gulp.src(this.getSrc(taskConfig), { base: this.getBase(taskConfig) })
            .pipe(plugins.compass(this.getCompassOpts(taskConfig)))
            .pipe(config.isProduction ? plugins.minifyCss() : plugins.util.noop())
            .pipe(gulp.dest(this.getDest(taskConfig)));
    },

    compileCss: function(taskConfig) {
        return gulp.src(this.getSrc(taskConfig), { base: this.getBase(taskConfig) })
            .pipe(plugins.filter('**/*.css'))
            .pipe(plugins.concat(taskConfig.dest))
            .pipe(config.isProduction ? plugins.minifyCss() : plugins.util.noop())
            .pipe(gulp.dest(config.destDir));
    },

    compileTemplates: function(taskConfig) {
        return gulp.src(this.getSrc(taskConfig), { base: this.getBase(taskConfig) })
            .pipe(plugins.jade())
            .pipe(gulp.dest(this.getDest(taskConfig)));
    },

    copyStatic: function(taskConfig) {
        return gulp.src(this.getSrc(taskConfig), { base: this.getBase(taskConfig) })
            .pipe(gulp.dest(this.getDest(taskConfig)));
    },

    getCompassOpts: function(taskConfig) {
        return {
            project: path.join(__dirname, '..', config.srcDir, taskConfig.compassModule),
            sass: 'styles',
            css: path.join(__dirname, '..', config.destDir, taskConfig.dest),
            image: path.join(config.srcDir, taskConfig.compassModule + '/img')
        };
    },

    injectDep: function(taskConfig, bowerGroup) {
        return gulp.src( this.getBase(taskConfig))
            .pipe(plugins.plumber())
            .pipe(plugins.jade({pretty: true}))
            .pipe(plugins.inject(gulp.src(bowerFiles({group: bowerGroup}), {read: false}), {name: 'bower'}))
            .pipe(plugins.useref({
                searchPath: './',
                base: './app/ui/'
            }))
            .pipe(plugins.if('*.js', plugins.uglify()))
            .pipe(plugins.if('*.css', plugins.minifyCss()))
            .pipe(gulp.dest(this.getDest(taskConfig)));
    }
};
