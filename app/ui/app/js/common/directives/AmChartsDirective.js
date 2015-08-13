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

    App.directive('amChart', [function () {
        return {
            scope: {
                options: '=',
                dataProvider: '=data',
                type: '@'
            },
            link: function ($scope, $element) {
                var id = generateId();
                $element.attr('id', id);

                var options = angular.extend({
                    dataProvider: []
                }, $scope.options);

                if ($scope.dataProvider) {
                    options.dataProvider = $scope.dataProvider;
                }

                options.type = $scope.type;

                AmCharts.isReady = true;
                    // The reason we can set "isReady" to "true" manually, is
                    // that we know, every element of DOM hierarchy is already
                    // loaded. If we don't set this value, there's a problem
                    // with loading charts after refreshing page on other then
                    // "dashboard" card.

                $scope.chart = AmCharts.makeChart(id, options);
            },
            controller: ['$scope', function($scope){
                $scope.$watch('dataProvider', function(newValue, oldValue) {
                    if(newValue !== oldValue) {
                        refreshGraphs($scope.chart.graphs, $scope.options.graphs, $scope.chart);
                        $scope.chart.dataProvider = newValue;
                        $scope.chart.validateData();
                    }
                });
            }]
        };
    }]);

    function refreshGraphs(existingList, newList, chart) {
        var existingGraphsNames = _.pluck(existingList, 'valueField');
        var newGraphsNames = _.pluck(newList, 'valueField');
        _.each(_.difference(existingGraphsNames, newGraphsNames), function(g){
            chart.removeGraph(_.findWhere(existingList, {valueField: g}));
        });
        _.each(_.difference(newGraphsNames, existingGraphsNames), function(g){
            chart.addGraph(_.findWhere(newList, {valueField: g}));
        });
    }

    function generateId() {
        return Math.random().toString(36).substr(2).toUpperCase();
    }

}());
