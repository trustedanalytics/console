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

    App.controller('DataSetsController', function ($scope, $routeParams, ngTableParams, State,
                                                   $cookies, DataSetsHelper) {

        var TOOL_KEY = 'datacatalog_tool',
            DEFAULT_TOOL = 'arcadia',
            searchText = '';

        $scope.pagination = {
            pageSize: 12,
            total: 0,
            currentPage: 1,
            pages: []
        };

        var category = null;
        $scope.onCategoryChange = function (c) {
            category = c;
            $scope.pagination.currentPage = 1;
            $scope.search();
        };

        $scope.format = {};
        $scope.created = {};
        $scope.tool = $cookies.get(TOOL_KEY) || DEFAULT_TOOL;

        $scope.$watch('tool', function () {
            $cookies.put(TOOL_KEY, $scope.tool);
        });

        var state = new State();
        state.value = state.values.DEFAULT;
        $scope.state = state;

        $scope.id = $routeParams.id || "";
        $scope.dataSets = {};

        /*jshint newcap: false*/
        function preparePagination() {
            var ngTable = new ngTableParams();
            $scope.pagination.pages = ngTable.generatePagesArray($scope.pagination.currentPage, $scope.pagination.total, $scope.pagination.numPerPage);
        }

        $scope.availableVisualizationsTools =[];

        DataSetsHelper.loadPlatformContext($scope.tool).then(function(data){
            $scope.availableVisualizationsTools = data.availableVisualizations;
            $scope.tool = data.tool;
        });

        $scope.isVisualizationToolAvailable = function (toolName) {
            return _.contains($scope.availableVisualizationsTools, toolName.toLowerCase());
        };

        /*jshint newcap: true*/
        $scope.search = function () {
            DataSetsHelper.search($scope, category, searchText)
                .then(function onSuccess() {
                    preparePagination();
                    $scope.state.setLoaded();
                });
        };

        $scope.$on('searchChanged', function (eventName, _searchText) {
            if(_searchText !== searchText) {
                searchText = _searchText;
                $scope.changePage(1);
            }
        });

        $scope.$on('targetChanged', function () {
            $scope.changePage(1);
        });

        $scope.$watchGroup(['created.from', 'created.to', 'format.value'], function (newValues, oldValues) {
            if (_.difference(newValues, oldValues)) {
                $scope.changePage(1);
            }
        });

        $scope.changePage = function (pageNo) {
            $scope.pagination.currentPage = pageNo;
            $scope.search();
        };

        $scope.getFormatIcon = DataSetsHelper.getFormatIcon;

        $scope.openFrom = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.fromOpened = true;
        };

        $scope.openTo = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.toOpened = true;
        };
    });
}());
