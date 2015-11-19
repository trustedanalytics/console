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

    App.directive('dTileSmallWhiteNumeric', function () {
        return {
            scope: {
                number: '=',
                text: '='
            },
            templateUrl: 'app/dashboard/tile-small-white-numeric.html'
        };
    });

    App.directive('dTileBlueNumeric', function () {
        return {
            scope: {
                number: '=',
                float: '=?',
                text: '=',
                unit: '=?'
            },
            templateUrl: 'app/dashboard/tile-blue-numeric.html'
        };
    });

    App.directive('dTileProgress', function () {
        return {
            scope: {
                value: '=',
                title: '='
            },
            templateUrl: 'app/dashboard/tile-progress.html'
        };
    });


    App.directive('dTileNews', function () {
        return {
            scope: {
                events: '='
            },
            templateUrl: 'app/dashboard/tile-news.html'
        };
    });

})();
