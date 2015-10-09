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
    App.controller('GearPumpController', ['$scope', '$location', 'State', 'ServiceResource',
        'ServiceInstanceResource', 'targetProvider', 'NotificationService',
        function ($scope, $location, State, ServiceResource, ServiceInstanceResource,
                  targetProvider, NotificationService) {

            var SERVICE_LABEL = $location.path().split('/').pop();
            $scope.brokerName = SERVICE_LABEL;
            $scope.state = new State();

            $scope.$on('targetChanged', onTargetChanged);


            onTargetChanged();

            function onTargetChanged() {
                $scope.organization = targetProvider.getOrganization();
                $scope.space = targetProvider.getSpace();
                getServiceId($scope, ServiceResource, ServiceInstanceResource, $scope.brokerName, NotificationService);
            }

            $scope.createInstance = function(name) {
                $scope.state.setPending();
                if($scope.servicePlans){
                    ServiceInstanceResource.createInstance(name, $scope.servicePlans[0].metadata.guid, $scope.organization.guid, $scope.space.guid)
                        .then(function () {
                            NotificationService.success('Creating an ' + $scope.brokerName +
                            ' instance may take a while. You can try to refresh the page after few seconds');
                        })
                        .catch(function () {
                            NotificationService.error('Failed to create the ' +$scope.brokerName +' instance.');
                        })
                        .finally(function () {
                            getBrokerInstances($scope, $scope.space.guid, $scope.serviceId, ServiceInstanceResource);
                            $scope.newInstanceName = "";
                        });
                }else {
                    NotificationService.error('Failed to create the ' +$scope.brokerName +' instance. Service Plan object does not exist.');
                }
            };

            $scope.deleteInstance = function (instanceId) {
                NotificationService.confirm('confirm-delete')
                    .then(function() {
                        $scope.state.setPending();
                        return ServiceInstanceResource.deleteInstance(instanceId);
                    })
                    .then(function onSuccess() {
                        NotificationService.success('Deleting an ' + $scope.brokerName +
                        ' instance may take a while. You can try to refresh the page after few seconds.');
                    })
                    .catch(function onError() {
                        $scope.state.setLoaded();
                        NotificationService.error('Deleting ' +$scope.brokerName +' instance failed.');
                    })
                    .finally(function () {
                        getBrokerInstances($scope, $scope.space.guid, $scope.serviceId, ServiceInstanceResource);
                    });
            };

            $scope.hasLogin = function (instances) {
               return _.some(instances, function(instance) {
                    return instance.login;
                });
            };

            $scope.hasPassword = function (instances) {
               return _.some(instances, function(instance) {
                    return instance.password;
                });
            };

            $scope.hasService = function (instances) {
                return _.some(instances, function(instance) {
                    return instance.service;
                });
            };


        }]);


    function getServiceId($scope, ServiceResource, ServiceInstanceResource, serviceLabel, NotificationService) {
        ServiceResource.getAllServicePlansForLabel(serviceLabel)
            .then(function(servicePlans) {
                if(!_.isEmpty(servicePlans)) {
                    $scope.servicePlans = servicePlans.plain();
                    $scope.serviceId = $scope.servicePlans[0].entity.service_guid;
                    getBrokerInstances($scope, $scope.space.guid, $scope.serviceId, ServiceInstanceResource);
                }
                else {
                    NotificationService.error("There are no gearpump instances.");
                }
            })
            .catch(function() {
                $scope.state.setError();
            });
    }

    function getBrokerInstances($scope, spaceId, serviceId, ServiceInstanceResource) {
        $scope.state.setPending();
        ServiceInstanceResource.getAllByType(spaceId, serviceId)
            .then(function(instances) {
                $scope.instances = instances;
                $scope.anyRows = $scope.instances.length;
                $scope.state.setLoaded();
            })
            .catch(function() {
                $scope.state.setError();
            });
    }

}());

