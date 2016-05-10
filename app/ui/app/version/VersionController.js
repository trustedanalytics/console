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

    App.controller('VersionController', function ($scope, State, VersionResource, CommonTableParams) {

        var state = new State().setPending();
        $scope.state = state;

        VersionResource.getSnapshots()
            .then(function (response) {
                $scope.currentSnapshot = response;

                $scope.platform_version = $scope.currentSnapshot.platform_version;
                $scope.cf_version = $scope.currentSnapshot.cf_version;
                $scope.cdh_version = $scope.currentSnapshot.cdh_version;
                $scope.versionTracking = [
                    {name: "Cloud Foundry API", version: $scope.cf_version},
                    {name: " TAP Platform", version: $scope.platform_version},
                    {name: "CDH", version: $scope.cdh_version}
                ];

                $scope.tableParams = CommonTableParams.getTableParams($scope, function () {
                    return $scope.versionTracking;
                });
                state.setLoaded();
            }).catch(function onError() {
                state.setError();
            });

           });
}());