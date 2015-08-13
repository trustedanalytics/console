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
(function() {
    App.directive('dTileLoadChart', [function () {
        return {
            scope: {},
            templateUrl: 'app/views/dashboard/tile-load-chart.html',
            controller: ['$scope', '$timeout', 'LoadChartResource', 'State',
            function ($scope, $timeout, LoadChartResource, State) {
                var DELAY = 30 * 1000,  // 30s
                    timeoutId = null,
                    state = new State().setPending();

                $scope.state = state;

                $scope.options = {
                    graphs: [
                        {
                            title: "test",
                            valueField: "value",
                            fillAlphas: 0.4,
                            lineColor: '#0076c7'
                        }
                    ],
                    categoryField: "timestamp",

                    categoryAxis: {
                        parseDates: true,
                        minPeriod: 'mm'
                    },
                    chartCursor: {
                        cursorAlpha: 0,
                        fullWidth: true,
                        categoryBalloonEnabled: false
                    }
                };

                function getData() {
                    LoadChartResource
                        .supressGenericError()
                        .getChart()
                        .then(function onSuccess(data) {
                            $scope.chartData = _.sortBy(data, 'timestamp');
                            state.setLoaded();
                        })
                        .catch(function onError() {
                            state.setError();
                        })
                        .finally(function onFinally() {
                            timeoutId = $timeout(getData, DELAY);
                        });
                }

                getData();

                $scope.$on('$destroy', function () {
                    if (timeoutId) {
                        $timeout.cancel(timeoutId);
                    }
                });
            }]
        };
    }]);
})();
