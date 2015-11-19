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

    App.controller('DataSetsController', function ($scope, DataSetResource, $routeParams, ngTableParams, State,
                                                   $cookies, PlatformContextProvider) {

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

        $scope.availableTools = [];

        loadPlatformContext(PlatformContextProvider, $scope.tool).then(function(data){
            $scope.availableTools = data.availableTools;
            $scope.tool = data.tool;
        });

        $scope.isToolAvailable = function (toolName) {
            return _.contains($scope.availableTools, toolName.toLowerCase());
        };

        /*jshint newcap: true*/

        $scope.search = function () {
            state.value = state.values.PENDING;
            var query = prepareQuery(category, $scope.created, $scope.format.value, $scope.pagination, searchText);
            DataSetResource
                .withErrorMessage('Failed to get the data sets')
                .getByQuery(query)
                .then(function onSuccess(data) {
                    populate(data || {});
                    preparePagination();
                    state.value = state.values.LOADED;
                }).catch(function () {
                    populate({});
                    $scope.state.setError();
                });
        };

        function populate(data) {
            $scope.formats = data.formats;
            $scope.dataSets = data.hits;
            $scope.categories = data.categories;
            $scope.pagination.total = data.total;
            $scope.pagination.numPerPage = Math.min($scope.pagination.total, $scope.pagination.pageSize);
        }

        $scope.$on('searchChanged', function (eventName, _searchText) {
            searchText = _searchText;
            $scope.changePage(1);

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

        $scope.getFormatIcon = getFormatIcon;

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

        $scope.search();
    });

    function getFormatIcon(format) {
        var knownFormats = {
            csv: 'table',
            json: 'json',
            xml: 'code'
        };

        return knownFormats[(format || '').toLowerCase()] || 'question';
    }

    function prepareQuery(category, created, formatValue, pagination, _searchText) {
        var filters = [];
        if (category) {
            filters.push({"category": [category]});
        }
        if (created.from || created.to) {
            var creationTime = [-1, -1];
            if (created.from) {
                creationTime[0] = created.from;
            }
            if (created.to) {
                creationTime[1] = created.to;
                creationTime[1].setHours(23, 59, 59);
            }
            filters.push({
                creationTime: creationTime
            });
        }
        if (formatValue) {
            filters.push({
                format: [formatValue.toLowerCase()]
            });
        }
        return {
            "query": _searchText,
            "filters": filters,
            "size": pagination.pageSize,
            "from": (pagination.currentPage - 1) * pagination.pageSize
        };
    }

    function loadPlatformContext (platformCtxProvider, tool) {
        return platformCtxProvider.getPlatformContext()
            .then(function onSuccess(data) {
                var DEFAULT_TOOL = 'arcadia';
                var externalTools = data.externalTools.list;
                var availableTools = _.pluck(_.where(externalTools, {available: true}), 'name').map(function (name) {
                    return name.toLowerCase();
                });

                if (!_.contains(availableTools, tool)) {
                    tool = _.contains(availableTools, DEFAULT_TOOL) ?
                        DEFAULT_TOOL :
                        _.first(availableTools);
                }

                return {
                    availableTools: availableTools,
                    tool: tool
                };
            });
    }
}());