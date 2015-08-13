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

    /*jshint newcap: false*/
    App.controller('DataSetTransferListController', ['$scope', 'State', 'DasResource',
        'ngTableParams', '$filter',

        function ($scope, State, DasResource, ngTableParams, $filter) {
            var self = this;

            $scope.state = new State().setPending();
            $scope.downloadQueue = [];

            $scope.$on('targetChanged', function () {
                $scope.downloadQueue = [];
                $scope.transfers.reload();
            });

            self.getData = function ($defer, params) {
                if (!_.isEmpty($scope.downloadQueue)) {
                    updateData($defer, params);
                    $scope.state.setLoaded();
                } else {
                    $scope.state.setPending();
                    DasResource
                        .withErrorMessage('Failed to get the transfers list')
                        .getTransfers()
                        .then(function (data) {
                            self.populateDataWithLastTimestamp(data);
                            updateData($defer, params);
                            $scope.state.setLoaded();
                        })
                        .catch(function () {
                            $scope.state.setError();
                        });
                }
            };

            $scope.reload = function() {
                $scope.state.setPending();
                $scope.downloadQueue = [];
                $scope.transfers.reload();
            };

            $scope.epochToUtc = function (epoch) {
                var date = new Date(0);
                date.setUTCSeconds(epoch);
                return date;
            };
            self.populateDataWithLastTimestamp = function (data) {
                $scope.downloadQueue = data;
                for (var i = 0; i < data.length; i++) {
                    $scope.downloadQueue[i].lastTimestamp = self.lastTimestamp(data[i].timestamps);
                }
            };
            self.lastTimestamp = function (timestamps) {
                var max = 0;

                for (var i in timestamps) {
                    if (timestamps[i] > max) {
                        max = timestamps[i];
                    }
                }

                return {state: i, time: max};
            };

            $scope.transfers = new ngTableParams({
                page: 1,
                count: 10,
                filter: {},
                sorting: {
                    'timestamps.NEW': 'desc'
                }
            }, {
                getData: self.getData
            });

            function updateData($defer, params) {
                var orderedData = !_.isEmpty(params.sorting()) ?
                    $filter('orderBy')($scope.downloadQueue, params.orderBy()) :
                    $scope.downloadQueue;

                orderedData = params.filter() ?
                    $filter('filter')(orderedData, params.filter()) :
                    orderedData;

                params.total(orderedData.length);
                var data = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                $defer.resolve(data);
            }
        }]);
}());
