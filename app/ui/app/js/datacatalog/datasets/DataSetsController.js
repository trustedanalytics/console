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

    App.controller('DataSetsController', ['$scope', 'DataSetResource', '$routeParams',
        'ngTableParams', 'State', '$cookies', 'PlatformContextProvider',
        function ($scope, DataSetResource, $routeParams, ngTableParams, State, $cookies, PlatformContextProvider) {

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

            $scope.$watch('tool', function() {
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

            PlatformContextProvider.getPlatformContext().then(function(data){
                var externalTools = data.externalTools.list;
                $scope.availableTools = _.pluck(_.where(externalTools, {available: true}), 'name').map(function(name) {
                    return name.toLowerCase();
                });

                if(!_.contains($scope.availableTools, $scope.tool)) {
                    $scope.tool = _.contains($scope.availableTools, DEFAULT_TOOL) ?
                        DEFAULT_TOOL :
                        _.first($scope.availableTools);
                }
            });

            $scope.isToolAvailable = function(toolName) {
                return _.contains($scope.availableTools, toolName.toLowerCase());
            };

            /*jshint newcap: true*/

            function prepareQuery() {
                var filters = [];
                if (category) {
                    filters.push({ "category": [category] });
                }
                if($scope.created.from || $scope.created.to) {
                    var creationTime = [-1, -1];
                    if($scope.created.from) {
                        creationTime[0] = $scope.created.from;
                    }
                    if($scope.created.to) {
                        creationTime[1] = $scope.created.to;
                    }
                    filters.push({
                        creationTime: creationTime
                    });
                }
                if($scope.format.value) {
                    filters.push({
                        format: [$scope.format.value.toLowerCase()]
                    });
                }
                return {
                    "query": searchText,
                    "filters": filters,
                    "size": $scope.pagination.pageSize,
                    "from": ($scope.pagination.currentPage - 1) * $scope.pagination.pageSize
                };
            }

            $scope.search = function () {
                state.value = state.values.PENDING;
                var query = prepareQuery();
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

            $scope.$on('searchChanged', function(eventName, _searchText){
                $scope.pagination.currentPage = 1;
                searchText = _searchText;
                $scope.search();
            });

            $scope.$on('targetChanged', function(){
                $scope.pagination.currentPage = 1;
                $scope.search();
            });

            $scope.$watch('created', function onCreatedChange(newValue, oldValue){
                if(newValue !== oldValue) {
                    $scope.search();
                }
            }, true);

            $scope.$watch('format', function onFormatChange(newValue, oldValue){
                if(newValue !== oldValue) {
                    $scope.search();
                }
            }, true);

            $scope.changePage = function(pageNo) {
                $scope.pagination.currentPage = pageNo;
                $scope.search();
            };

            $scope.getFormatIcon = getFormatIcon;

            $scope.openFrom = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.fromOpened = true;
            };

            $scope.openTo = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.toOpened = true;
            };

            $scope.search();

        }]);

    function getFormatIcon(format) {
        var knownFormats = {
            csv: 'table',
            json: 'json',
            xml: 'code'
        };

        return knownFormats[(format || '').toLowerCase()] || 'question';
    }
}());
