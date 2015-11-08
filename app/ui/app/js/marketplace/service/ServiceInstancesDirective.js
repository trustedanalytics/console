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

    App.controller('ServiceInstancesController', function (ServiceInstanceResource, $scope, targetProvider, State,
        NotificationService) {

        var self = this,
            id = $scope.serviceId;

        var ATK_SERVICE_NAME = "atk";

        var state = new State();
        self.state = state;

        self.instancesState = new State().setLoaded();
        self.deleteState = new State().setDefault();

        self.getInstances = function () {
            getInstancesData(self, targetProvider.getSpace(), id, ServiceInstanceResource);
        };

        var updateInstances = function () {
            self.instancesState.setPending();
            self.deleteState.setDefault();
            if (targetProvider.getSpace()) {
                self.getInstances();
            }
        };
        updateInstances();

        $scope.$on('instanceCreated', function () {
            updateInstances();
        });

        self.tryDeleteInstance = function (instance) {
            NotificationService.confirm('confirm-delete', {instanceToDelete: instance})
                .then(function onConfirm() {
                    self.deleteInstance(instance);
                });
        };

        self.deleteInstance = function (instance) {
            if (!instance) {
                return;
            }

            self.deleteState.setPending();
            ServiceInstanceResource
                .supressGenericError()
                .deleteInstance(instance.guid)
                .then(function () {
                    self.deleteState.setDefault();
                    NotificationService.success('Instance has been deleted');
                    updateInstances();
                })
                .catch(function (error) {
                    if (error.status === 500 && $scope.serviceName === ATK_SERVICE_NAME) {
                        self.deleteState.setDefault();
                        NotificationService.success("Deleting an ATK instance may take a while. You can try to refresh the page after in a minute or two.", "Task scheduled");
                    }
                    else {
                        self.deleteState.setDefault();
                        NotificationService.genericError(error.data, 'Error while deleting the instance');
                    }
                });
        };

        $scope.$on('targetChanged', function () {
            updateInstances();
        });

        self.organization = targetProvider.getOrganization;
        self.space = targetProvider.getSpace;
    });


    App.directive('dServiceInstances', function () {
        return {
            scope: {
                serviceId: '=',
                serviceName: '='
            },
            controller: 'ServiceInstancesController as ctrl',
            templateUrl: 'app/views/marketplace/service/service-instances.html'
        };
    });


    function getInstancesData(self, space, serviceId, ServiceInstanceResource) {
        ServiceInstanceResource
            .withErrorMessage('Failed to retrieve service instances')
            .getAllByType(space.guid, serviceId)
            .then(function (instances) {
                self.instances = instances;
                self.instancesState.setLoaded();
            })
            .catch(function () {
                self.instancesState.setError();
            });
    }
}());
