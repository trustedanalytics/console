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
        ServiceKeysResource, NotificationService, jsonFilter, blobFilter, KubernetesServicesResource, ServiceInstancesMapper,
        UserProvider) {

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
            ServiceKeysResource
                .withErrorMessage('Adding new service key failed. Check that the service broker supports that feature.')
                .addKey(keyName, instance.guid)
                .then(function() {
                    NotificationService.success("Service key has been added");
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
            KubernetesServicesResource
                .withErrorMessage("Error changing service visibility")
                .setVisibility(targetProvider.getOrganization().guid, targetProvider.getSpace().guid, instance.guid, visibility)
                .then(function () {
                    NotificationService.success("Service visibility has been changed");
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
                ServiceInstancesResource
                    .withErrorMessage('Error loading service instances')
                    .getSummary(targetProvider.getSpace().guid, true)
                    .then(function success(data) {
                        $scope.services = succeededInstances(mergeService(data));
                        getKubernetesServices();
                    })
                    .finally(function () {
                        state.setLoaded();
                    });
            } else {
                state.setLoaded();
            }
        }

        function getKubernetesServices() {
            var isK8sAvailable = _.some($scope.services, function(s) {
                return _.contains(s.tags, "k8s");
            });
            if(isK8sAvailable && $scope.admin) {
                KubernetesServicesResource
                    .withErrorMessage('Error loading kubernetes services')
                    .services(targetProvider.getOrganization().guid, targetProvider.getSpace().guid)
                    .then(function success(data) {
                        mergeWithScopeServices(data);
                    });
            }
        }

        function mergeWithScopeServices(data) {
            var predata = _.reduce(data, function (memo, instance) {
                if(!memo[instance.serviceId]) {
                    memo[instance.serviceId] = {public: false, uri: []};
                }
                if(instance.tapPublic) {
                    memo[instance.serviceId].public = true;
                    memo[instance.serviceId].uri = memo[instance.serviceId].uri.concat(instance.uri);
                }
                return memo;
            }, {});

            _.each($scope.services, function (service) {
                _.each(service.instances, function(instance) {
                    if(predata[instance.guid]) {
                        instance["kubernetes"] = predata[instance.guid];
                    }
                });
            });
        }

        function refreshVcapConfiguraton(ServiceInstancesMapper) {
            $scope.vcap = ServiceInstancesMapper.getVcapConfiguration($scope.services, $scope.exports);
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

    function succeededInstances(services) {
         var result = _.each(services, function(service) {
            service.instances = _.filter(service.instances, function(si) {
                return normalizeLastOperationState(si.last_operation.state) === "succeeded";
            });
        });
        return _.filter(result, function(service) {
            return !_.isEmpty(service.instances);
        });
    }

    function normalizeLastOperationState(lastOperationState) {
        return lastOperationState.replace(/\s+/g, '-').toLowerCase();
    }

}());
