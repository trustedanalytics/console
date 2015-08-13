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
// config.js

module.exports = {
    srcDir: 'app/ui',
    destDir: 'target/app/ui',
    testsDir: 'test/javascript',
    isProduction: false,

    staticDir: 'static',

    js: {
        app: {
            src: [
                'app/js/_init.js',
                'app/js/**/*.js'
            ],
            dest: 'app/js/app.js'
        },

        vendorBase: {
            src: require('../vendor.base.json'),
            dest: 'app/js/base.js',
            base: '../..'
        },

        newAccount: {
            src: 'new-account/js/*.js',
            dest: 'new-account/js/new-account.js'
        }
    },

    styles: {
        app: {
            src: 'app/scss/app.scss',
            base: 'app/scss',
            dest: 'app/css',
            watch: 'app/scss/**/*.scss',
            compassModule: 'app'
        },

        newAccount: {
            src: 'new-account/scss/new-account.scss',
            base: 'new-account/scss',
            dest: 'new-account/css',
            watch: 'new-account/scss/**/*.scss',
            compassModule: 'new-account'
        },

        vendorBase: {
            src: require('../vendor.base.json'),
            dest: 'app/css/vendor.css',
            base: '../..'
        },
    },

    templates: {
        app: {
            src: 'app/views/index.jade',
            base: 'app/views'
        },

        views: {
            src: 'app/views/**/*.jade'
        },

        newAccount: {
            src: 'new-account/jade/*.jade',
            base: 'new-account/jade',
            dest: 'new-account'
        }
    },

    vendor: {
        src: require('../vendor.json'),
        dest: 'vendor',
        base: '../../bower_components'
    },

    static: {
        common: {
            src: 'static/**',
            base: 'static',
            dest: '.'
        },

        newAccount: {
            src: 'new-account/static/**',
            base: 'new-account/static',
            dest: 'new-account'
        }
    }
};
