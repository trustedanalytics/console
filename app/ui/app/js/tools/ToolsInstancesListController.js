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

    App.controller('ToolsInstancesListController', ['$scope', '$location', 'targetProvider', 'State', 'NotificationService',
        'ToolsInstanceResource', 'ServiceResource', 'ServiceInstanceResource', '$state',
        function ($scope, $location, targetProvider, State, NotificationService, ToolsInstanceResource, ServiceResource,
                  ServiceInstanceResource, $state) {

            $scope.servicePlanGuid = "";
            $scope.state = new State();

            var SERVICE_LABEL = $location.path().split('/').pop();
            $scope.instanceType = SERVICE_LABEL;
            $scope.brokerName = $state.current.entityDisplayName;

            $scope.$on('targetChanged', onTargetChanged);

            onTargetChanged();
            setServicePlan($scope, ServiceResource, SERVICE_LABEL);


            function onTargetChanged() {
                $scope.organization = targetProvider.getOrganization();
                $scope.space = targetProvider.getSpace();
                getInstances($scope, ToolsInstanceResource, $scope.organization.guid, $scope.space.guid, $scope.instanceType);
            }

            $scope.createInstance = function (name) {
                $scope.state.setPending();
                ServiceInstanceResource
                    .withErrorMessage('Failed to create the instance of ' + $scope.brokerName)
                    .createInstance(name, $scope.servicePlanGuid, $scope.organization.guid, $scope.space.guid)
                    .then(function () {
                        NotificationService.success('Creating an ' + $scope.brokerName +
                            ' instance may take a while. You can try to refresh the page after few seconds.');
                    })
                    .finally(function () {
                        getInstances($scope, ToolsInstanceResource, $scope.organization.guid, $scope.space.guid, $scope.instanceType);
                        $scope.newInstanceName = "";
                    });
            };

            $scope.deleteInstance = function (appId) {
                NotificationService.confirm('confirm-delete')
                    .then(function() {
                        $scope.state.setPending();
                        return ServiceInstanceResource
                            .withErrorMessage('Deleting instance of ' + $scope.brokerName + ' failed')
                            .deleteInstance(appId);
                    })
                    .then(function onSuccess() {
                        NotificationService.success('Deleting instance of ' + $scope.brokerName +
                                                    ' may take a while. You can try to refresh the page after few seconds.');
                    })
                    .finally(function () {
                        getInstances($scope, ToolsInstanceResource, $scope.organization.guid, $scope.space.guid, $scope.instanceType);
                    });
            };
        }]);

    var checkIsObject = function(value) {
        return typeof(value) === typeof({});
    };

    var getInstancesFromResponse = function(apps) {
        var result = apps.plain();
        return _.omit(result, function(val) {
           return !checkIsObject(val);
        });
    };

    function getInstances($scope, ToolsInstanceResource, orgId, spaceId, serviceType) {
        if(orgId && spaceId && serviceType) {
            $scope.state.setPending();
            ToolsInstanceResource.getToolsInstances(orgId, spaceId, serviceType)
                .then(function(response) {
                    $scope.instances = getInstancesFromResponse(response);
                    $scope.anyRows = (Object.keys($scope.instances).length) ? true : false;
                    $scope.state.setLoaded();
                })
                .catch(function() {
                    $scope.state.setError();
                });
        } else {
            $scope.anyRows = false;
        }
    }

    var getServicePlanGuid = function(servicePlans) {
        return _.map(
            _.filter(servicePlans, function predicate(plan) {
                return plan.entity.free;
            }),
            function getGuid(plan) {
                return plan.metadata.guid;
            }
        )[0];
    };

    function setServicePlan($scope, ServiceResource, serviceLabel) {
        $scope.state.setPending();
        ServiceResource.getAllServicePlansForLabel(serviceLabel)
            .then(function(servicePlans) {
                $scope.servicePlanGuid = getServicePlanGuid(servicePlans);
            });
    }
}());
