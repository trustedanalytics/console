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

    App.controller('ApplicationRegisterController', function ($scope, State, targetProvider,
            ApplicationRegisterHelpers) {

        $scope.service = {
            app: {
                metadata: {
                    guid: $scope.appId
                }
            },
            description: "",
            name: "",
            tags: [],
            metadata: {}
        };


        $scope.state = new State().setPending();
        $scope.offerings = [];

        $scope.submitRegister = submitRegister;
        $scope.addTag = addTag;

        updateServiceOrgGuid();
        refreshOfferings();


        $scope.$on('targetChanged', function () {
            updateServiceOrgGuid();
        });

        function submitRegister() {
            $scope.state.setPending();

            ApplicationRegisterHelpers
                .registerApp($scope.service)
                .then(function(newOffering) {
                    $scope.offerings.push(newOffering);
                })
                .finally(function () {
                    $scope.state.setLoaded();
                });
        }

        function refreshOfferings() {
            $scope.state.setPending();

            ApplicationRegisterHelpers
                .getOfferingsOfApp($scope.appId)
                .then(function (offerings) {
                    $scope.offerings = offerings;
                })
                .finally(function() {
                    $scope.state.setLoaded();
                });
        }

        function addTag(tag) {
            $scope.service.tags.push(tag);
        }

        function updateServiceOrgGuid() {
            $scope.service.org_guid = (targetProvider.getOrganization() || {}).guid;
        }
    });


})();