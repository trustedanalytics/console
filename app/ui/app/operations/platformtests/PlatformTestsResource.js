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

    App.factory('PlatformTestsResource', function (Restangular) {

        var service = Restangular.service('platform_tests').one().all('tests');

        service.getTestSuites = function () {
            return this.getList();
        };

        service.getResults = function (testSuiteId) {
            return this.one(testSuiteId).all("results").customGET("");
        };

        service.runTestSuite = function (username, password) {
            return this.post({
                "username": username,
                "password": password
            });
        };

        service.getAvailableTestSuites = function () {
            return this.one().all('suites').getList();
        };

        return service;
    });

}());
