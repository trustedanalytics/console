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
(function () {
    "use strict";

    App.config(function ($ocLazyLoadProvider, LazyLoadConfig) {
        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
            modules: LazyLoadConfig.modules
        });
    })
    .constant('LazyLoadConfig', {
        modules: [
            {
                name: 'xeditable',
                files: ['vendor/angular-xeditable/dist/js/xeditable.js',
                        'vendor/angular-xeditable/dist/css/xeditable.css']
            },
            {
                name: 'dibari.angular-ellipsis',
                files: ['vendor/angular-ellipsis/src/angular-ellipsis.min.js']
            },
            {
                name: 'ngMessages',
                files: ['vendor/angular-messages/angular-messages.min.js']
            }
        ],
        standalones: [
            {
                name: 'modernizr',
                files: ['vendor/modernizr/modernizr.js']
            }, {
                name: 'icons',
                files: ['vendor/fontawesome/css/font-awesome.min.css',
                        'vendor/simple-line-icons/css/simple-line-icons.css']
            }, {
                name: 'parsley',
                files: ['vendor/parsleyjs/dist/parsley.min.js']
            }, {
                name: 'c3charts-serial',
                files: ['vendor/d3/d3.min.js',
                        'vendor/c3/c3.min.js',
                        'vendor/c3/c3.min.css'],
                serie: true
            }, {
                name: 'highlightjs',
                files: ['vendor/highlightjs/highlight.pack.js',
                        'vendor/highlightjs/styles/github.css']
            }, {
                name: 'ng-file-upload',
                files: ['vendor/ng-file-upload/ng-file-upload.min.js']
            },
            {
                name: 'bootstrap-datetimepicker',
                files: ['vendor/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                        'vendor/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css']
            }
        ]
    });

})();
