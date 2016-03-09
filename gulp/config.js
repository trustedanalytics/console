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
                'app/_init.js',
                'app/**/*.js'
            ],
            dest: 'app/app.js'
        },

        vendorBase: {
            src: require('../vendor.base.json'),
            dest: 'app/base.js',
            base: '../..'
        },

        newAccount: {
            src: 'new-account/**/*.js',
            dest: 'new-account/new-account.js'
        }
    },

    styles: {
        app: {
            src: 'app/styles/app.scss',
            base: 'app',
            dest: 'app',
            watch: 'app/**/*.scss',
            compassModule: 'app'
        },

        newAccount: {
            src: 'new-account/styles/new-account.scss',
            base: 'new-account/styles',
            dest: 'new-account',
            watch: 'new-account/styles/**/*.scss',
            compassModule: 'new-account'
        },

        vendorBase: {
            src: require('../vendor.base.json'),
            dest: 'app/vendor.css',
            base: '../..'
        }
    },

    templates: {
        app: {
            src: 'app/index.jade',
            base: 'app'
        },

        views: {
            src: 'app/**/*.jade'
        },

        newAccount: {
            src: 'new-account/**/*.jade',
            base: 'new-account',
            dest: 'new-account'
        }
    },

    vendor: {
        src: require('../vendor.json'),
        dest: 'vendor',
        base: '../../bower_components'
    },

    inject: {
        newAccount: {
            base: 'new-account/new-account.jade',
            dest: 'new-account'
        }
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
        },

        bootstrapGlyphicons: {
            src: '../../bower_components/bootstrap-sass/assets/fonts/**/*',
            base: '../../bower_components/bootstrap-sass/assets/fonts/bootstrap',
            dest: 'fonts/bootstrap'
        }
    }
};
