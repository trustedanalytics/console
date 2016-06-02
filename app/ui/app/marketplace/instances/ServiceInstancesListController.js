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
        ServiceKeysResource, NotificationService, jsonFilter, blobFilter, KubernetesServicesResource, ServiceInstancesMapper, ServiceInstancesListHelper, UserProvider) {

        var state = new State().setPending();
        $scope.state = state;
        $scope.exports = [];
        $scope.vcap = {};

        UserProvider.isAdmin().then(function (isAdmin) {
            $scope.admin = isAdmin;
            refreshContent();
        });

        $scope.$on('targetChanged', function () {
            refreshContent();
        });

        $scope.addExport = function (key) {
            $scope.exports.push(key);
            refreshVcapConfiguraton(ServiceInstancesMapper);
        };

        $scope.removeExport = function (key) {
            $scope.exports = _.without($scope.exports, key);
            refreshVcapConfiguraton(ServiceInstancesMapper);
        };

        $scope.hasKeys = function(instance) {
            return !_.isEmpty(instance.service_keys);
        };

        $scope.isExported = function(key) {
            return _.contains($scope.exports, key);
        };

        $scope.addKey = function(keyName, instance) {
            state.setPending();
            ServiceInstancesListHelper
                .addKey(keyName, instance.guid)
                .then(function() {
                    refreshContent();
                })
                .catch(function() {
                    state.setLoaded();
                });
        };

        $scope.deleteKey = function(key) {
            NotificationService.confirm('delete-key-confirm')
                .then(function() {
                    state.setPending();
                    ServiceKeysResource
                        .withErrorMessage('Removing service key failed')
                        .deleteKey(key.guid)
                        .then(function() {
                            NotificationService.success("Service key has been deleted");
                            refreshContent();
                        })
                        .catch(function() {
                            state.setLoaded();
                        });
                });
        };

        $scope.exposeInstance = function(instance, visibility) {
            state.setPending();
            ServiceInstancesListHelper
                .exposeInstance(instance.guid, visibility)
                .then(function () {
                    refreshContent();
                })
                .catch(function() {
                    state.setLoaded();
                });
        };

        function refreshContent() {
            state.setPending();
            $scope.exports = [];
            $scope.vcap = {};
            if (targetProvider.getSpace().guid) {
                ServiceInstancesListHelper
                    .refreshContent($scope)
                    .finally(function () {
                        state.setLoaded();
                    });
            } else {
                state.setLoaded();
            }
        }

        function refreshVcapConfiguraton(ServiceInstancesMapper) {
            $scope.vcap = ServiceInstancesMapper.getVcapConfiguration($scope.services, $scope.exports);
            $scope.file = blobFilter(jsonFilter($scope.vcap));
        }
    });
}());
