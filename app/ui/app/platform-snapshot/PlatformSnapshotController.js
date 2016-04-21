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

    App.controller('PlatformSnapshotController', function ($scope, State, PlatformSnapshotResource) {

        var state = new State().setPending();
        $scope.state = state;

        var searchText = "";
        $scope.chosenSnapshot = "";
        var chosenSnapshotApplications = {};

        function getSnapshotsByScope(scope, startDate) {
            state.setPending();
            PlatformSnapshotResource.getSnapshots(scope, startDate)
                .then(function (response) {
                    $scope.response = response;
                    if(response[0]) {
                        $scope.chosenSnapshot = response[0];
                        $scope.currentVersion = response[0].platform_version;
                        chosenSnapshotApplications = $scope.chosenSnapshot.applications;
                    }
                    state.setLoaded();
                }).catch(function onError() {
                    state.setError();
                });
        }

        var currentDate = moment().utc().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ss") + 'Z';

        PlatformSnapshotResource.getConfiguration()
            .then(function (response) {
                $scope.configuration = response;
                $scope.scopes = response.scopes;
                $scope.defaultScope = response.scopes[0];
                getSnapshotsByScope($scope.defaultScope, currentDate);
                $scope.state = state.setLoaded();
            }).catch(function onError() {
                state.setError();
            });

        $scope.setScope = function (scope) {
            $scope.scope = scope;
            $scope.defaultScope = scope;
            getSnapshotsByScope(scope, currentDate);
        };

        $scope.getAppsForSnapshot = function (id) {
            $scope.chosenSnapshot = _.findWhere($scope.response, {"id": id});
            $scope.currentVersion = $scope.chosenSnapshot.platform_version;
            chosenSnapshotApplications = $scope.chosenSnapshot.applications;
        };

        $scope.getSnapshotsByRange = function (days) {
            currentDate = moment().utc().subtract(days, 'days').format("YYYY-MM-DDTHH:mm:ss") + 'Z';
            getSnapshotsByScope($scope.scope, currentDate);

        };

        $scope.fields = {"guid":false,"created":false, "updated":false,"organization":false,"space":false, "memory":false,"instances":false, "state":false,
         "disk": false};

        $scope.isCollapsed = true;

        $scope.export = function () {
            $scope.toJSON = angular.toJson($scope.chosenSnapshot);
            $scope.chosenSnapshotId = $scope.chosenSnapshot.id;
            var blob = new Blob([$scope.toJSON], { type:"text/plain" }),
                url = window.URL || window.webkitURL;
            $scope.downloadLink = url.createObjectURL(blob);
        };

        $scope.showDetails = function (name, visible) {
            $scope.fields[name] = !visible;
        };

        $scope.$on('searchChanged', function (eventName, _searchText) {
            searchText = _searchText;
            if(searchText==="") {
                $scope.chosenSnapshot.applications = chosenSnapshotApplications;
            } else {
                $scope.chosenSnapshot.applications = $scope.search();
            }
        });


        $scope.search = function () {
            return _.filter(chosenSnapshotApplications, function (element) {
                return element.name.indexOf(searchText) > -1;
            });
        };

    });
}());