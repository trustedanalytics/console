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
    'use strict';

    App.factory('ServiceInstancesListHelper', function (ServiceKeysResource, NotificationService, targetProvider,
                                                        KubernetesServicesResource, ServiceInstancesResource) {

        return {
            succeededInstances: succeededInstances,
            addKey: addKey,
            exposeInstance: exposeInstance,
            refreshContent: refreshContent
        };

        function refreshContent($scope) {
            return ServiceInstancesResource
                .withErrorMessage('Error loading service instances')
                .getSummary(targetProvider.getSpace().guid, true)
                .then(function success(data) {
                    $scope.services = succeededInstances(data);
                    getKubernetesServices($scope);
                });
        }

        function getKubernetesServices($scope) {
            var isK8sAvailable = _.some($scope.services, function(s) {
                return _.contains(s.tags, "k8s");
            });
            if(isK8sAvailable && $scope.admin) {
                getKubernetesService()
                    .then(function success(data) {
                        $scope.services = mergeWithScopeServices(data, $scope.services);
                    });
            }
        }

        function exposeInstance(guid, visibility) {
            return KubernetesServicesResource
                .withErrorMessage("Error changing service visibility")
                .setVisibility(targetProvider.getOrganization().guid, targetProvider.getSpace().guid, guid, visibility)
                .then(function () {
                    NotificationService.success("Service visibility has been changed");
                });
        }

        function getKubernetesService() {
            return KubernetesServicesResource
                .withErrorMessage('Error loading kubernetes services')
                .services(targetProvider.getOrganization().guid, targetProvider.getSpace().guid);
        }

        function addKey(keyName, guid) {
            return ServiceKeysResource
                .withErrorMessage('Adding new service key failed. Check that the service broker supports that feature.')
                .addKey(keyName, guid)
                .then(function() {
                    NotificationService.success("Service key has been added");
                });
        }

        function mergeWithScopeServices(data, services) {
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

            return _.each(services, function (service) {
                return _.each(service.instances, function(instance) {
                    if(predata[instance.guid]) {
                        instance["kubernetes"] = predata[instance.guid];
                    }
                });
            });
        }

        function succeededInstances(data) {
            var services = mergeService(data);
            var result = _.each(services, function(service) {
                service.instances = _.filter(service.instances, function(si) {
                    return normalizeLastOperationState(si.last_operation.state) === "succeeded";
                });
            });
            return _.filter(result, function(service) {
                return !_.isEmpty(service.instances);
            });
        }

        function mergeService(data) {
            return _.map(data, function (service) {
                var extra = service.extra ? JSON.parse(service.extra) : {};
                var merged = _.extend({}, service, extra);
                return merged;
            });
        }

        function normalizeLastOperationState(lastOperationState) {
            return lastOperationState.replace(/\s+/g, '-').toLowerCase();
        }

    });
}());