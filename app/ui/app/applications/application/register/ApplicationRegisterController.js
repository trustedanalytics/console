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
    'use strict';

    App.controller('ApplicationRegisterController', function ($scope, State, ApplicationRegisterResource,
        NotificationService, targetProvider) {

        $scope.service = {
            app: {
                metadata: {
                    guid: ""
                }
            },
            description: "",
            name: "",
            tags: [],
            metadata: {}
        };
        $scope.state = new State().setPending();

        $scope.submitRegister = submitRegister;
        $scope.addTag = addTag;
        $scope.$parent.$watch('application', function (application) {
            if(application) {
                $scope.service.app.metadata.guid = application.guid;
                $scope.state.setLoaded();
                ApplicationRegisterResource
                    .withErrorMessage('Failed to get cloned applications from catalog')
                    .getClonedApplication($scope.service.app.metadata.guid )
                    .then(function (response) {
                        $scope.clonedApps = response.plain();
                    });
            }
        });



        function submitRegister() {
            $scope.state.setPending();

            $scope.service.creator_info = { creator_guid: $scope.$parent.appId, creator_name: $scope.$parent.application.name };
            $scope.service.org_guid = (targetProvider.getOrganization() || {}).guid;
            ApplicationRegisterResource
                .withErrorMessage('Failed to register application in marketplace')
                .registerApplication($scope.service)
                .then(function (response) {
                    $scope.clonedApps.push(response.plain());
                    NotificationService.success('Application has been registered in marketplace');
                }).finally(function () {
                    $scope.state.setLoaded();
                });
        }

        function addTag(tag) {
            $scope.service.tags.push(tag);
        }
    });
})();