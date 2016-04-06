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

    App.controller('PlatformTestSuiteRunController', function ($scope, $state, State, PlatformTestsResource,
       NotificationService) {

        $scope.state = new State();
        $scope.state.setLoaded();
        $scope.username = '';
        $scope.password = '';

        $scope.runTestSuite = function () {
            $scope.state.setPending();
            PlatformTestsResource
                .withErrorMessage('Failed to trigger platform test suite run')
                .runTestSuite($scope.username, $scope.password)
                .then(function () {
                    $scope.state.setLoaded();
                    NotificationService.success('Platform test suite has been started');
                    $state.go('app.platformtests.list');
                })
                .catch(function () {
                    $scope.state.setError();
                });
        };
    });

}());
