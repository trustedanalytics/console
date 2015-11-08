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

    App.controller('ServiceInstancesListController', function ($scope, State, targetProvider, ServiceInstancesResource,
        jsonFilter, blobFilter) {

        var state = new State().setPending();
        $scope.state = state;
        $scope.exports = [];
        $scope.vcap = {};

        refreshContent();

        $scope.$on('targetChanged', function () {
            refreshContent();
        });

        $scope.addExport = function (key) {
            $scope.exports.push(key);
            refreshVcapConfiguraton();
        };

        $scope.removeExport = function (key) {
            $scope.exports = _.without($scope.exports, key);
            refreshVcapConfiguraton();
        };

        function refreshContent() {
            state.setPending();
            $scope.exports = [];
            $scope.vcap = {};
            if (targetProvider.getSpace().guid) {
                ServiceInstancesResource
                    .withErrorMessage('Error loading service keys')
                    .getSummary(targetProvider.getSpace().guid, true)
                    .then(function success(data) {
                        $scope.services = mergeService(data);
                    })
                    .finally(function () {
                        state.setLoaded();
                    });
            }
        }

        function refreshVcapConfiguraton() {
            $scope.vcap = getVcapConfiguration($scope.services, $scope.exports);
            $scope.file = blobFilter(jsonFilter($scope.vcap));
        }
    });

    function mergeService(data) {
        return _.map(data, function (service) {
            var extra = service.extra ? JSON.parse(service.extra) : {};
            var merged = _.extend({}, service, extra);
            return merged;
        });
    }

    function getVcapConfiguration(services, keys) {
        return _.reduce(_.map(keys, _.partial(getVcapForKey, services)), function (memo, vcap) {
            if (memo[vcap.label]) {
                memo[vcap.label].push(vcap);
            } else {
                memo[vcap.label] = [vcap];
            }
            return memo;
        }, {});
    }

    function getVcapForKey(services, key) {
        var service = _.find(services, function (s) {
            return _.findWhere(s.instances, {guid: key.service_instance_guid});
        });
        var instance = _.findWhere(service.instances, {guid: key.service_instance_guid});
        return {
            label: service.label,
            name: instance.name,
            plan: instance.service_plan.name,
            tags: service.tags,
            credentials: key.credentials
        };
    }

}());
