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

    App.controller('ApplicationBindingsController', function ($scope, ApplicationResource, ServiceBindingResource,
            applicationBindingExtractor, State, $stateParams, NotificationService) {

            var self = this,
                appId = $stateParams.appId;

            var state = new State().setPending();
            self.state = state;
            self.appId = appId;

            self.loadBindings = function () {
                loadBindings(self, ApplicationResource, applicationBindingExtractor);
            };

            self.setApplication = function (application) {
                self.application = application;
                updateInstances(self);
            };

            $scope.$watch('appCtrl.application', function (application) {
                self.setApplication(application);
            });

            self.setInstances = function (instances) {
                self.services = instances;
                updateInstances(self);
            };

            $scope.$watch('appCtrl.instances', function (instances) {
                self.setInstances(instances);
            });

            self.bindService = function (service) {
                if (!self.application) {
                    return;
                }
                state.value = state.values.PENDING;
                ApplicationResource
                    .withErrorMessage('Failed to bind the service')
                    .createBinding(self.application.guid, service.guid)
                    .then(function () {
                        NotificationService.success('Service has been bound');
                    })
                    .finally(function () {
                        self.loadBindings();
                    });
            };

            self.unbindService = function (service) {
                if (!self.application) {
                    return;
                }
                state.value = state.values.PENDING;
                var binding = _.findWhere(self.bindings, {service_instance_guid: service.guid});
                if (binding) {
                    ServiceBindingResource.deleteBinding(binding.guid)
                        .then(function () {
                            NotificationService.success('Service has been unbound');
                            self.loadBindings();
                        })
                        .catch(function () {
                            NotificationService.error('Failed to bind the service');
                            self.loadBindings();
                        });
                }
            };

            self.loadBindings();
        }
    );

    function updateInstances(self) {
        if (!self.application || !self.services || !self.bindings) {
            return;
        }

        var bounderServiceIds = _.pluck(self.bindings, 'service_instance_guid');

        self.servicesBound = self.services.filter(function (s) {
            return _.contains(bounderServiceIds, s.guid);
        });
        self.servicesAvailable = _.difference(self.services, self.servicesBound);

        self.state.value = self.state.values.LOADED;
    }

    function loadBindings(self, ApplicationResource, applicationBindingExtractor) {
        ApplicationResource.getAllBindings(self.appId)
            .then(function onSuccess(bindings) {
                self.bindings = applicationBindingExtractor.extract(bindings);
                updateInstances(self);
            })
            .catch(function onError() {
                self.state.setError();
            });
    }
}());
