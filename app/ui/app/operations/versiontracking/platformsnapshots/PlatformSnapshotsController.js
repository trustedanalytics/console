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

    App.controller('PlatformSnapshotsController', function ($scope, State, VersionTrackingResource, CommonTableParams,
                                                            NotificationService) {

        var state = new State().setPending();
        $scope.state = state;

        function getSnapshots(startDate) {
            state.setPending();
            VersionTrackingResource.getSnapshots(startDate)
                .then(function (response) {
                    $scope.response = response;
                    if ($scope.chosenSnapshot) {
                        $scope.getSnapshotDetails($scope.chosenSnapshot.id);
                    } else {
                        $scope.chosenSnapshot = response[0];
                    }
                    state.setLoaded();
                }).catch(function onError() {
                    state.setError();
                });
        }

        var currentDate = moment().utc().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ss") + 'Z';

        getSnapshots(currentDate);

        $scope.snapshotsTableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.response;
        });

        $scope.appsTableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.chosenSnapshot.applications;
        });

        $scope.cdhServicesTableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.chosenSnapshot.cdh_services;
        });

        $scope.cfServicesTableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.chosenSnapshot.cf_services;
        });

        $scope.getSnapshotsByRange = function (days) {
            currentDate = moment().utc().subtract(days, 'days').format("YYYY-MM-DDTHH:mm:ss") + 'Z';
            getSnapshots(currentDate);
        };

        $scope.$watch('chosenSnapshot', function (newValue, oldValue) {
            if ((oldValue && !newValue) || (newValue && oldValue && newValue.id !== oldValue.id)) {
                NotificationService.success('Snapshot was changed');
            }
        });

        $scope.getSnapshotDetails = function (id) {
            $scope.chosenSnapshot = _.findWhere($scope.response, {"id": id});
        };
    });
}());
