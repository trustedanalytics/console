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


    App.controller('ServiceController', function (ServiceResource, serviceExtractor, NotificationService, $stateParams,
        targetProvider, $scope, ServiceInstanceResource, State) {

        var self = this,
            id = $stateParams.serviceId;

        var ATK_SERVICE_NAME = "atk";

        self.serviceId = id;

        self.state = new State().setPending();
        self.deleteState = new State().setLoaded();
        self.newInstanceState = new State().setDefault();

        self.organization = function () {
            return targetProvider.getOrganization();
        };
        self.space = function () {
            return targetProvider.getSpace();
        };

        self.getService = function () {
            getServiceData(self, id, ServiceResource, serviceExtractor);
        };

        self.createServiceInstance = function (plan) {
            if (targetProvider.getSpace()) {
                self.newInstanceState.setPending();
                ServiceInstanceResource
                    .supressGenericError()
                    .createInstance(
                        self.newInstance.name,
                        plan.guid,
                        targetProvider.getOrganization().guid,
                        targetProvider.getSpace().guid
                    )
                    .then(function () {
                        self.newInstanceState.setDefault();
                        NotificationService.success('Instance has been created');
                        $scope.$broadcast('instanceCreated');
                    })
                    .catch(function (error) {
                        if (self.service.name === ATK_SERVICE_NAME && error.status >= 500) {
                            self.newInstanceState.setDefault();
                            NotificationService.success("Creating an ATK instance may take a while. You can try to refresh the page after a minute or two.", "Task scheduled");
                        }
                        else {
                            self.newInstanceState.setError();
                            NotificationService.genericError(error.data, 'Error creating new service instance');
                        }
                    });
            }
        };

        self.getService();

        self.selectPlan = function (plan) {
            self.selectedPlan = plan;
            self.newInstanceState.setDefault();
        };
    });

    function getServiceData(self, id, Service, serviceExtractor) {
        Service
            .withErrorMessage('Failed to retrieve service details')
            .getService(id)
            .then(function (serviceData) {
                self.service = serviceExtractor.extractService(serviceData || {});
                self.selectedPlan = self.service.plans[0];
                self.state.setLoaded();
            })
            .catch(function (status) {
                self.state.setError(status);
            });
    }

}());
