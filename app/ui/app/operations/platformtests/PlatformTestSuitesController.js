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

    App.controller('PlatformTestSuitesController', function ($scope, State, $q, PlatformTestsResource,
        PlatformTestSuitesTableParams) {

        $scope.state = new State();
        $scope.state.setPending();
        $scope.testSuites = [];

        $scope.updateTestSuites = function () {
            $scope.state.setPending();
            PlatformTestsResource
                .withErrorMessage('Failed to load platform test suites list')
                .getTestSuites()
                .then(function (testSuites) {
                    $scope.testSuites = testSuites;
                    $scope.state.setLoaded();
                    $scope.tableParams.reload();
                })
                .catch(function () {
                    $scope.state.setError();
                });

        };
        $scope.updateTestSuites();

        $scope.states = function () {
            var def = $q.defer();
            def.resolve([
                {id: 'PASS', title: 'PASS'},
                {id: 'FAIL', title: 'FAIL'},
                {id: 'IN_PROGRESS', title: 'IN PROGRESS'}
            ]);
            return def;
        };

        $scope.tableParams = PlatformTestSuitesTableParams.getTableParams($scope, function () {
            return $scope.testSuites;
        });

    });

}());
