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

    App.controller('DataToolsController', function ($scope, $http, targetProvider, AtkInstanceResource, State,
        NotificationService, serviceExtractor, ServiceResource, ServiceInstanceResource, ApplicationResource) {

        var GATEWAY_TIMEOUT_ERROR = 504;
        var state = new State().setPending();
        var clientState = new State().setPending();
        var deleteState = new State().setLoaded();
        var newInstanceState = new State().setDefault();
        $scope.state = state;
        $scope.clientState = clientState;
        $scope.deleteState = deleteState;
        $scope.newInstanceState = newInstanceState;

        var org = targetProvider.getOrganization();
        $scope.organization = org;

        $scope.$on('targetChanged', function () {
            org = targetProvider.getOrganization();
            if (org.guid) {
                getAtkInstances($scope, org, AtkInstanceResource);
            }
        });

        if (org.guid) {
            $scope.state.setPending();
            getAtkInstances($scope, org, AtkInstanceResource);
        }

        $scope.createInstance = function (name) {
            $scope.newInstanceState.setPending();
            ServiceInstanceResource
                .supressGenericError()
                .createInstance(
                    name,
                    $scope.servicePlanGuid,
                    targetProvider.getOrganization().guid,
                    targetProvider.getSpace().guid
                )
                .then(function onSuccess() {
                    $scope.newInstanceState.setDefault();
                    notifySuccessInstanceCreation(NotificationService);
                    getAtkInstances($scope, targetProvider.getOrganization(), AtkInstanceResource);
                })
                .catch(function(error) {
                    if(error.status === GATEWAY_TIMEOUT_ERROR) {
                        notifySuccessInstanceCreation(NotificationService);
                    } else {
                        NotificationService.genericError(error.data, 'Error creating new service instance');
                    }
                })
                .finally(function () {
                    $scope.newInstanceState.setDefault();
                });
            $scope.newInstanceName = null;
        };

        $scope.deleteInstance = function (instanceName, instanceGuid, serviceGuid) {
            NotificationService.confirm('confirm-delete', {instanceToDelete: instanceName})
                .then(function () {
                    $scope.deleteState.setPending();
                    $scope.deleteService(serviceGuid);
                    ApplicationResource
                        .supressGenericError()
                        .deleteApplication(instanceGuid, true)
                        .then(function () {
                            NotificationService.success('Application has been deleted');
                            getAtkInstances($scope, targetProvider.getOrganization(), AtkInstanceResource);
                        })
                        .catch(function (error) {
                            if (error.status === 500) {
                                NotificationService.success("Deleting an TAP Analytics Toolkit instance may take a while. You can try to refresh the page after in a minute or two.", "Task scheduled");
                            }
                            else {
                                NotificationService.genericError(error.data, 'Error while deleting the application');
                            }
                        })
                        .finally(function () {
                            $scope.deleteState.setDefault();
                        });
                });
        };
        $scope.deleteService = function (serviceGuid) {
            ServiceInstanceResource.deleteInstance(serviceGuid);
        };
    });


    function getAtkInstances($scope, org, AtkInstanceResource) {
        $scope.state.setPending();
        $scope.deleteState.setDefault();
        AtkInstanceResource.getAll(org.guid)
            .then(function onSuccess(response) {
                $scope.instances = response.instances;
                $scope.servicePlanGuid = response.service_plan_guid;
                $scope.state.setLoaded();
            });
    }

    function notifySuccessInstanceCreation(notificationService) {
        notificationService.success("Creating an TAP Analytics Toolkit instance may take a while. You can try to " +
        "refresh the page after in a minute or two.", "Task scheduled");
    }
}());
