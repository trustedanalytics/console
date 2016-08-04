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

    App.controller('PlatformSnapshotsDiffsController', function ($scope, State, VersionTrackingResource, CommonTableParams) {

        var state = new State().setPending();
        $scope.state = state;

        function getSnapshots(startDate) {
            state.setPending();
            VersionTrackingResource.getSnapshots(startDate)
                .then(function (response) {
                    $scope.response = response;
                    $scope.snapshotsTableParams = CommonTableParams.getTableParams($scope, function () {
                        return $scope.response;
                    });
                    state.setLoaded();
                }).catch(function onError() {
                    state.setError();
                });
        }

        var currentDate = moment().utc().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ss") + 'Z';

        getSnapshots(currentDate);

        $scope.selected = {};
        $scope.countSelected = function () {
            return _.filter($scope.selected).length;
        };

        $scope.getDiff = function () {
            var before = Object.keys($scope.selected)[0];
            var after = Object.keys($scope.selected)[1];

            state.setPending();
            VersionTrackingResource.getDiff(before, after)
                .then(function (response) {
                    $scope.diff = response.plain();
                    $scope.appsList = filterMetrics($scope.diff.applications);
                    $scope.cdhServicesList = filterMetrics($scope.diff.cdh_services);
                    $scope.cfServicesList = filterMetrics($scope.diff.cf_services);

                    $scope.appsTableParams = CommonTableParams.getTableParams($scope, function () {
                        return $scope.appsList;
                    });

                    $scope.cdhServicesTableParams = CommonTableParams.getTableParams($scope, function () {
                        return $scope.cdhServicesList;
                    });

                    $scope.cfServicesTableParams = CommonTableParams.getTableParams($scope, function () {
                        return $scope.cfServicesList;
                    });
                    state.setLoaded();
                }).catch(function onError() {
                    state.setError();
                });
        };

        $scope.changeSelected = function (id) {
            if (!$scope.selected[id]) {
                delete $scope.selected[id];
            }
        };

        $scope.getSnapshotsByRange = function (days) {
            currentDate = moment().utc().subtract(days, 'days').format("YYYY-MM-DDTHH:mm:ss") + 'Z';
            getSnapshots(currentDate);
        };

        function filterMetrics(object) {
            return _.filter(object, function (obj) {
                return obj.operation === "CHANGED" || (obj.operation === "ADDED" && obj.metric === "createdAt") ||
                    (obj.operation === "REMOVED" && obj.metric === "createdAt");
            });
        }
    });
}());
