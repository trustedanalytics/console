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
// Karma configuration
// Generated on Mon Nov 17 2014 12:14:31 GMT+0100 (CET)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-chai'],


        // list of files / patterns to load in the browser
        files: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/underscore/underscore.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-bootstrap/ui-bootstrap.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/oclazyload/dist/ocLazyLoad.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/ua-parser-js/dist/ua-parser.min.js',
            'bower_components/ng-table/dist/ng-table.js',
            'bower_components/ngstorage/ngStorage.js',
            'bower_components/ngDialog/js/ngDialog.js',
            'bower_components/angularjs-toaster/toaster.js',
            'bower_components/restangular/dist/restangular.js',
            'bower_components/angular-mocks/angular-mocks.js',

            'app/ui/**/*.js',

            'test/javascript/ui/*.js',
            'test/javascript/ui/**/*.js'
        ],


        // list of files to exclude
        exclude: [
            '**/karma.conf.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'app/**/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter : {
            type : 'lcov',
            dir : 'target/reports/karma-coverage',
            subdir : 'lcov'
        },


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_W4,bpv-ARN || config.LOG_INFO || config.
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        browserify: {
            debug: true
        }
    });
};
