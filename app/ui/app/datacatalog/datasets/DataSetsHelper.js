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
    'use strict';

    App.factory('DataSetsHelper', function (PlatformContextProvider, DataSetResource) {

        return {
            getFormatIcon: getFormatIcon,
            prepareQuery: prepareQuery,
            loadPlatformContext: loadPlatformContext,
            search: search
        };

        function search($scope, category, searchText) {
            $scope.state.setPending();
            var query = prepareQuery(category, $scope.created, $scope.format.value, $scope.pagination, searchText);
            return DataSetResource
                .withErrorMessage('Failed to get the data sets')
                .getByQuery(query)
                .then(function onSuccess(data) {
                    populate($scope, data || {});
                }).catch(function () {
                    populate($scope, {});
                    $scope.state.setError();
                });
        }

        function populate($scope, data) {
            $scope.formats = data.formats;
            $scope.dataSets = data.hits;
            $scope.categories = data.categories;
            $scope.pagination.total = data.total;
            $scope.pagination.numPerPage = Math.min($scope.pagination.total, $scope.pagination.pageSize);
        }

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
                filters.push({
                    "category": [category]
                });
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

        function loadPlatformContext(tool) {
            return PlatformContextProvider.getPlatformContext()
                .then(function onSuccess(data) {
                    var DEFAULT_TOOL = 'arcadia';
                    var externalTools = data.external_tools;

                    var availableVisualizationsTools = _.pluck(_.where(externalTools.visualizations, {
                        available: true
                    }), 'name').map(function (name) {
                        return name.toLowerCase();
                    });

                    if (!_.contains(availableVisualizationsTools, tool)) {
                        tool = _.contains(availableVisualizationsTools, DEFAULT_TOOL) ?
                            DEFAULT_TOOL :
                            _.first(availableVisualizationsTools);
                    }

                    return {
                        availableVisualizations: availableVisualizationsTools,
                        tool: tool
                    };
                });
        }
    });
}());
