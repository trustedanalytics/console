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

    App.controller('IPythonController', ['$scope', 'targetProvider', 'State', 'NotificationService',
        'ServiceInstanceResource', 'ApplicationResource', 'ServicePlanResource',
        function ($scope, targetProvider, State, NotificationService, ServiceInstanceResource,
                  ApplicationResource, ServicePlanResource) {
            var state = new State().setPending();
            $scope.state = state;

            var IPYTHON_SERVICE_LABEL = 'ipython-proxy';
            var IPYTHON_SERVICE_PLANE_NAME = 'simple';

            $scope.service_plan = "";

            var org = targetProvider.getOrganization();
            $scope.organization = org;

            var space = targetProvider.getSpace();
            $scope.space = space;

            $scope.$on('targetChanged', function () {
                space = targetProvider.getSpace();
                if (space.guid) {
                    getInstances($scope, ApplicationResource, space.guid, IPYTHON_SERVICE_LABEL);
                }
            });

            if (space.guid) {
                setServicePlan($scope, ServicePlanResource, IPYTHON_SERVICE_LABEL, IPYTHON_SERVICE_PLANE_NAME);
                getInstances($scope, ApplicationResource, space.guid, IPYTHON_SERVICE_LABEL);
            }

            $scope.createInstance = function (name, service_plan_guid) {
                org = targetProvider.getOrganization().guid;
                space = targetProvider.getSpace().guid;
                ServiceInstanceResource.createInstance(name, service_plan_guid, org, space)
                    .then(function () {
                        $scope.state.setPending();
                        NotificationService.success('Application has been created');
                    })
                    .catch(function () {
                        NotificationService.error('Failed to create the Application');
                    })
                    .finally(function () {
                        getInstances($scope, ApplicationResource, space, IPYTHON_SERVICE_LABEL);
                    });
            };

            $scope.deleteInstance = function (appId) {
                NotificationService.confirm('confirm-delete')
                    .then(function(cascade) {
                        $scope.state.setPending();
                        return ApplicationResource.deleteApplication(appId, cascade[0]);
                    })
                    .then(function onSuccess() {
                        NotificationService.success('Application has been deleted');
                    })
                    .catch(function onError() {
                        $scope.state.setLoaded();
                        NotificationService.error('Deleting application failed');
                    })
                    .finally(function () {
                        getInstances($scope, ApplicationResource, targetProvider.getSpace().guid, IPYTHON_SERVICE_LABEL);
                    });
            };

        }]);

    function getInstances($scope, ApplicationResource, spaceId, serviceLabel) {
        ApplicationResource.getAllByServiceType(spaceId, serviceLabel)
            .then( function(applications) {
                $scope.instances = applications;
                $scope.state.setLoaded();
            })
            .catch( function() {
                $scope.state.setError();
            });
    }

    function setServicePlan($scope, ServicePlanResource, serviceLabel, planName) {
        $scope.state.setPending();
        ServicePlanResource.getPlan(planName, serviceLabel)
            .then( function(plan) {
                $scope.service_plan = plan;
            })
            .catch( function() {
                $scope.state.setError();
            });
    }


}());

