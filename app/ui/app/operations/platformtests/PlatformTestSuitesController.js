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

    App.controller('PlatformTestSuitesController', function ($scope, State, PlatformTestsResource, NotificationService,
                                                             PlatformTestSuitesTableParams) {

        $scope.availableTestSuitesState = new State();
        $scope.availableTestSuitesState.setPending();
        $scope.availableTestSuites = [];
        $scope.listTestSuiteState = new State();
        $scope.listTestSuiteState.setPending();
        $scope.testSuites = [];
        $scope.queue = [];

        $scope.updateAvailableTestSuites = function () {
            $scope.availableTestSuitesState.setPending();
            PlatformTestsResource
                .withErrorMessage('Failed to load platform available tests list')
                .getAvailableTestSuites()
                .then(function (availableTestSuites) {
                    $scope.availableTestSuites = availableTestSuites;
                    $scope.availableTestSuitesState.setLoaded();
                })
                .catch(function () {
                    $scope.availableTestSuitesState.setError();
                });
        };
        $scope.updateAvailableTestSuites();

        $scope.addToQueue = function (suite) {
            if (_.some($scope.queue, {id: suite.id})) {
                NotificationService.warning('Duplicates are not allowed in queue');
            } else {
                $scope.queue.push(suite);
            }
        };

        $scope.runTestSuite = function (suite) {
            PlatformTestsResource
                .withErrorMessage('Failed to trigger platform test suite run')
                .runTestSuite(suite.username, suite.password)
                .then(function () {
                    NotificationService.success('Platform test suite has been started');
                    $scope.queue = _.reject($scope.queue, {id: suite.id});
                    $scope.updateTestSuites();
                });
        };

        $scope.updateTestSuites = function () {
            $scope.listTestSuiteState.setPending();
            PlatformTestsResource
                .withErrorMessage('Failed to load platform tests list')
                .getTestSuites()
                .then(function (testSuites) {
                    $scope.testSuites = testSuites;
                    $scope.listTestSuiteState.setLoaded();
                    $scope.tableParams.reload();
                })
                .catch(function () {
                    $scope.listTestSuiteState.setError();
                });
        };
        $scope.updateTestSuites();

        $scope.tableParams = PlatformTestSuitesTableParams.getTableParams($scope, function () {
            return $scope.testSuites;
        });

    });

}());
