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

    App.controller('DashboardController', ['$scope', 'targetProvider', 'State', 'OrgMetricsResource', '$timeout', 'LoadChartResource',
        function ($scope, targetProvider, State, OrgMetricsResource, $timeout, LoadChartResource) {

            var state = new State().setPending();
            $scope.state = state;
            var timeoutId;

            var getMetrics = function () {
                if (targetProvider.getOrganization().guid) {
                    $timeout.cancel(timeoutId);

                    OrgMetricsResource.getMetrics(targetProvider.getOrganization().guid)
                        .then(function onSuccess(data){
                            $scope.data = data;
                            LoadChartResource.getChart()
                                .then(function onSuccess(chartData) {
                                    $scope.data.throughput = parseFloat(
                                        _.last(_.sortBy(chartData, 'timestamp')).value
                                    ).toFixed(2);
                                    state.setLoaded();
                                }).catch(function onError() {
                                    state.setError();
                                });
                        })
                        .catch(function onError() {
                            state.setError();
                        });

                    timeoutId = $timeout(getMetrics, 15 * 1000);
                }
            };

            $scope.$on('targetChanged', function(){
                state.setPending();
                getMetrics();
            });

            $scope.$on('$destroy', function(){
                $timeout.cancel(timeoutId);
            });

            getMetrics();
        }]);
}());
