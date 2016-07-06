/**
 * Copyright (c) 2016 Intel Corporation
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

    App.controller('ServiceInstanceDetailsController', function ($scope, State, ServiceInstanceResource,
            NotificationService, $stateParams, $state) {
        var instanceId = $stateParams.instanceId;
        var GATEWAY_TIMEOUT_ERROR = 504;
        var INSTANCE_NOT_FOUND_ERROR = 404;
        var state = new State().setPending();
        $scope.state = state;

        $scope.deleteState = new State().setDefault();

        ServiceInstanceResource.getById(instanceId)
            .then(function (serviceInstance) {
                $scope.serviceInstance = serviceInstance;
                $scope.state.setLoaded();
            })
            .catch(function onError (error) {
                if (error.status === INSTANCE_NOT_FOUND_ERROR) {
                    $state.go('app.marketplace.instances');
                } else {
                    $scope.state.setError();
                    NotificationService.error(error.data.message || 'An error occurred while loading service instance page');
                }
            });

        $scope.tryDeleteInstance = function () {
            NotificationService.confirm('confirm-delete', {instance: $scope.serviceInstance.name})
                .then(function onConfirm () {
                    $scope.deleteServiceInstance();
                });
        };

        $scope.deleteServiceInstance = function () {
            $scope.deleteState.setPending();
            ServiceInstanceResource
                .supressGenericError()
                .deleteInstance(instanceId)
                .then(function () {
                    NotificationService.success('Instance has been deleted');
                    $state.go('app.marketplace.instances');
                })
                .catch(function (error) {
                    if (error.status === GATEWAY_TIMEOUT_ERROR) {
                        NotificationService.success("Deleting an instance may take a while. Please refresh the page after a minute or two.", "Task scheduled");
                    }
                    else {
                        NotificationService.genericError(error.data, 'Error while deleting the instance');
                    }
                })
                .finally(function () {
                    $scope.deleteState.setDefault();
                });
        };
    });
}());