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

    App.controller('DashboardController', function ($scope, targetProvider, State, OrgMetricsResource, $timeout,
        LoadChartResource, UserProvider) {

        var state = new State().setPending(),
            metricsTimeoutHandler,
            loadTimeoutHandler,
            TIMEOUT = 15 * 1000; // 15s

        $scope.state = state;
        $scope.loadChart = {
            values: null,
            state: new State().setPending()
        };
        $scope.organizations = targetProvider.getOrganizations();

        $scope.$on('targetChanged', function () {
            state.setPending();
            getMetrics();
        });

        $scope.$on('$destroy', function () {
            $timeout.cancel(metricsTimeoutHandler);
            $timeout.cancel(loadTimeoutHandler);
        });

        $scope.canManageUsers = function() {
            return $scope.anyOrgManager || $scope.admin;
        };

        UserProvider.isAdmin(function (isAdmin) {
            $scope.admin = isAdmin;
        });


        getMetrics();
        getLoadData();

        $scope.$watchCollection('organizations', function(orgs) {
            $scope.anyOrgManager = UserProvider.isAnyOrgManager(orgs);
        });

        function getMetrics() {
            $timeout.cancel(metricsTimeoutHandler);

            var orgId = targetProvider.getOrganization().guid;
            if (orgId) {
                OrgMetricsResource.getMetrics(orgId)
                    .then(function onSuccess(data) {
                        $scope.data = data;
                        state.setLoaded();
                    })
                    .catch(function onError() {
                        state.setError();
                    })
                    .finally(function () {
                        metricsTimeoutHandler = $timeout(getMetrics, TIMEOUT);
                    });
            }
        }

        function getLoadData() {
            $timeout.cancel(loadTimeoutHandler);
            LoadChartResource.supressGenericError()
                .getChart()
                .then(function onSuccess(data) {
                    $scope.loadChart.values = _.sortBy(data, 'timestamp');
                    $scope.loadChart.state.setLoaded();
                })
                .catch(function onError() {
                    $scope.loadChart.state.setError();
                })
                .finally(function () {
                    loadTimeoutHandler = $timeout(getLoadData, TIMEOUT);
                });
        }

    });
}());
