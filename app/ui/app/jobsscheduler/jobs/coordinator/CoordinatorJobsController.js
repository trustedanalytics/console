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

    App.controller('CoordinatorJobsController', function ($scope, State, CommonTableParams, JobsConfig,
                                                          CoordinatorJobResource, targetProvider) {

        var state = new State().setPending();
        $scope.state = state;

        $scope.$on('targetChanged', function () {
            $scope.state.setPending();
            $scope.getJobs($scope.unit, $scope.amount);
        });

        $scope.timeRanges = JobsConfig.timeRanges;
        $scope.unit = 'days';
        $scope.amount = 1;

        $scope.getJobs = function (unit, amount) {
            $scope.state.setPending();
            $scope.unit = unit;
            $scope.amount= amount;
            CoordinatorJobResource.getJobs(targetProvider.getOrganization().guid, unit, amount)
                .then(function (response) {
                    $scope.coordinatorjobs = response;
                    if($scope.tableParams) {
                        $scope.tableParams.page(1);
                        $scope.tableParams.reload();
                    }
                    $scope.state = state.setLoaded();
                }).catch(function onError() {
                    state.setError();
                });
        };
        $scope.getJobs($scope.unit, $scope.amount);

        $scope.tableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.coordinatorjobs;
        });

    });


}());
