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
        'ServiceInstanceResource', 'ApplicationResource',
        function ($scope, targetProvider, State, NotificationService, ServiceInstanceResource, ApplicationResource) {
            var state = new State().setPending();
            $scope.state = state;

            var IPYTHON_SERVICE_LABEL = 'ipython';

            // Service plan guid for ipython will be temporarily hardcoded in console. It is the same
            // across all of the environments.
            // Cf-client does not support yet properly the functionality to return a plan guid
            // for a specific service (DPNG-1502)
            var IPYTHON_SERVICE_PLAN_GUID = 'e87979c6-22d3-4b56-b2cd-953c5b6630de';

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
                $scope.state.setPending();
                getInstances($scope, ApplicationResource, space.guid, IPYTHON_SERVICE_LABEL);
            }

            $scope.createInstance = function (name) {
                org = targetProvider.getOrganization().guid;
                space = targetProvider.getSpace().guid;
                ServiceInstanceResource.createInstance(name, IPYTHON_SERVICE_PLAN_GUID, org, space)
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
        $scope.state.setPending();
        ApplicationResource.getAllByServiceType(spaceId, serviceLabel)
            .then( function(applications) {
                $scope.instances = applications;
                $scope.state.setLoaded();
            })
            .catch( function() {
                $scope.state.setError();
            });
    }


}());

