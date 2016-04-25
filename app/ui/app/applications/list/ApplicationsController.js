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

    App.controller('ApplicationsController', function (ApplicationResource, targetProvider, $scope, ngTableParams,
        $q, AtkInstanceResource, CommonTableParams, State) {

        $scope.state = new State().setPending();
        $scope.details = [];

        function getApplications() {
            return ApplicationResource
                .withErrorMessage('Failed to load applications list')
                .getAll(targetProvider.getSpace().guid)
                .then(function (applications) {
                    return applications;
                });
        }

        var updateApplications = function () {
            if (_.isEmpty(targetProvider.getSpace())) {
                return;
            }

            $scope.state.setPending();
            getApplications()
                .then(function (applications) {
                    $scope.applications = applications;
                    $scope.state.setLoaded();
                    $scope.tableParams.reload();
                }).catch(function () {
                    $scope.state.setError();
                });
        };
        updateApplications();

        $scope.tableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.applications;
        });

        $scope.$on('targetChanged', function () {
            updateApplications();
        });

        $scope.appStates = function () {
            var def = $q.defer();
            def.resolve([
                {id: 'STARTED', title: 'STARTED'},
                {id: 'STARTING', title: 'STARTING'},
                {id: 'STOPPED', title: 'STOPPED'}
            ]);
            return def;
        };

        $scope.checkStatusProblem = function (app) {
            return app.running_instances === 0 && app.state === 'STARTED';
        };
    });

}());
