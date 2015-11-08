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

    App.controller('PlatformDashboardController', function ($scope, State, PlatformResource, NotificationService,
        $state) {

        var state = new State().setPending();
        $scope.state = state;

        PlatformResource.getSummary()
            .then(function (response) {
                $scope.response = response;
                $scope.controllerSummary = response.controllerSummary;
                $scope.componentSummary = response.componentSummary;
                $scope.state = state.setLoaded();
            }).catch(function onError() {
            state.setError();
        });

        var self = this;
        self.isTabActive = function (sref) {
            return $state.is(sref) || $state.includes(sref);
        };

        $scope.onRefresh = function () {
            $scope.state = state.setPending();
            PlatformResource.refreshCache()
                .then(function () {
                    $scope.state = state.setLoaded();
                    NotificationService.success('Please wait a few minutes for refresh state');
                }).catch(function onError() {
                state.setError();
            });
        };

    });
}());
