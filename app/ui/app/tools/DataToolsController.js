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

    App.controller('DataToolsController', function ($scope, $http, $q, targetProvider, AtkInstanceResource, State,
        NotificationService, serviceExtractor, ServiceResource, ServiceInstanceResource, ApplicationResource,
        spaceUserService, UserProvider) {

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
            initializeInstances($scope, $q, org, AtkInstanceResource, spaceUserService, NotificationService, UserProvider);
        });

        initializeInstances($scope, $q, org, AtkInstanceResource, spaceUserService, NotificationService, UserProvider);

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
                    $scope.state.setPending();
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
                    $scope.state.setLoaded();
                    $scope.newInstanceState.setDefault();
                });
            $scope.newInstanceName = null;
        };

        $scope.deleteInstance = function (instanceName, instanceGuid, serviceGuid) {
            NotificationService.confirm('confirm-delete', {instanceToDelete: instanceName})
                .then(function () {
                    $scope.state.setPending();
                    $scope.deleteState.setPending();
                    ServiceInstanceResource
                        .withErrorMessage('Error while deleting a service instance')
                        .deleteInstance(serviceGuid)
                        .then(function() {
                            NotificationService.success('Application has been deleted');
                            return getAtkInstances($scope, targetProvider.getOrganization(), AtkInstanceResource);
                        })
                        .finally(function() {
                            $scope.state.setLoaded();
                            $scope.deleteState.setDefault();
                        });
                });
        };
    });

    function initializeInstances($scope, $q, org, AtkInstanceResource, spaceUserService, NotificationService, UserProvider) {
        if (org.guid) {
            $scope.state.setPending();
            getAtkInstances($scope, org, AtkInstanceResource)
                .then(function() {
                    return canCurrentUserCreateInstance($scope, $q, org, spaceUserService, UserProvider);
                })
                .then(function(canCreate) {
                    if (canCreate) {
                        var defaultInstanceName = "atk-" + org.name;
                        confirmCreatingImmediateInstance($scope, NotificationService, defaultInstanceName);
                    }
                    $scope.state.setLoaded();
                });
        }
    }

    function getAtkInstances($scope, org, AtkInstanceResource) {
        $scope.state.setPending();
        $scope.deleteState.setDefault();
        return AtkInstanceResource.getAll(org.guid)
            .then(function onSuccess(response) {
                $scope.instances = response.instances;
                $scope.servicePlanGuid = response.service_plan_guid;
            });
    }

    function canCurrentUserCreateInstance($scope, $q, org, spaceUserService, UserProvider) {
        var deferred = $q.defer();
        if (org.guid && org.name && !$scope.instances) {
            $scope.state.setPending();
            if(UserProvider.isAdmin()) {
                deferred.resolve(true);
            } else {
                spaceUserService.getSpaceUser()
                    .then(function(currentUser) {
                        deferred.resolve(isSpaceDeveloper(currentUser));
                    })
                    .catch(deferred.reject);
            }
        } else {
            deferred.resolve(false);
        }
        return deferred.promise;
    }

    function confirmCreatingImmediateInstance($scope, NotificationService, defaultInstanceName) {
        NotificationService.confirm('confirm-creating-instance', {instanceToCreate: defaultInstanceName})
            .then(function (instanceToCreate) {
                $scope.createInstance(instanceToCreate[0]);
            });
    }

    function notifySuccessInstanceCreation(notificationService) {
        notificationService.success("Creating an TAP Analytics Toolkit instance may take a while. You can try to " +
        "refresh the page after in a minute or two.", "Task scheduled");
    }

    function isSpaceDeveloper(user) {
        if (user && _.contains(user.roles, "developers")) {
            return true;
        }
        return false;
    }

}());
