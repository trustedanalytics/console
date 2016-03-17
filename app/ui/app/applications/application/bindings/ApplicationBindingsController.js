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

            var appId = $stateParams.appId;

            var state = new State().setPending();
            $scope.state = state;
            $scope.appId = appId;

            $scope.loadBindings = function () {
                loadBindings($scope, ApplicationResource, applicationBindingExtractor);
            };

            $scope.setApplication = function (application) {
                $scope.application = application;
                updateInstances($scope);
            };

            $scope.$watch('$parent.application', function (application) {
                $scope.setApplication(application);
            });

            $scope.setInstances = function (instances) {
                $scope.services = instances;
                updateInstances($scope);
            };

            $scope.$watch('$parent.instances', function (instances) {
                $scope.setInstances(instances);
            });

            $scope.bindService = function (service) {
                if (!$scope.application) {
                    return;
                }
                state.value = state.values.PENDING;
                ApplicationResource
                    .withErrorMessage('Failed to bind the service')
                    .createBinding($scope.application.guid, service.guid)
                    .then(function () {
                        NotificationService.success('Service has been bound');
                    })
                    .finally(function () {
                        $scope.loadBindings();
                    });
            };

            $scope.unbindService = function (service) {
                if (!$scope.application) {
                    return;
                }
                state.value = state.values.PENDING;
                var binding = _.findWhere($scope.bindings, {service_instance_guid: service.guid});
                if (binding) {
                    ServiceBindingResource.deleteBinding(binding.guid)
                        .then(function () {
                            NotificationService.success('Service has been unbound');
                            $scope.loadBindings();
                        })
                        .catch(function () {
                            NotificationService.error('Failed to bind the service');
                            $scope.loadBindings();
                        });
                }
            };

            $scope.loadBindings();
        }
    );

    function updateInstances($scope) {
        if (!$scope.application || !$scope.services || !$scope.bindings) {
            return;
        }

        var bounderServiceIds = _.pluck($scope.bindings, 'service_instance_guid');

        $scope.servicesBound = $scope.services.filter(function (s) {
            return _.contains(bounderServiceIds, s.guid);
        });
        $scope.servicesAvailable = _.difference($scope.services, $scope.servicesBound);

        $scope.state.value = $scope.state.values.LOADED;
    }

    function loadBindings($scope, ApplicationResource, applicationBindingExtractor) {
        return ApplicationResource.getAllBindings($scope.appId)
            .then(function onSuccess(bindings) {
                $scope.bindings = applicationBindingExtractor.extract(bindings);
                updateInstances($scope);
            })
            .catch(function onError() {
                $scope.state.setError();
            });
    }
}());
