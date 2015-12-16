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

    App.controller('H2OModelsController', function ($scope, State, ModelResource, ModelsTableParams, targetProvider) {

        var state = new State().setPending();
        $scope.state = state;

        $scope.$on('targetChanged', function () {
            $scope.state.setPending();
            getInstances();
        });

        function getInstances() {
            ModelResource.getInstances(targetProvider.getOrganization().guid)
                .then(function (response) {
                    $scope.instances = response;
                    $scope.state = state.setLoaded();
                }).catch(function onError() {
                    state.setError();
                });
        }
        getInstances();

        var chosenInstance;

        $scope.onInstanceChange = function (instance) {
            chosenInstance = instance;
            if (!chosenInstance) {
                $scope.filteredModels = getAllModels();
            }
            else {
                $scope.filteredModels = chosenInstance.models;
            }
            $scope.tableParams.reload();
        };

        function getAllModels() {
            return _.flatten(_.pluck($scope.instances, "models"), true);
        }

        $scope.tableParams = ModelsTableParams.getTableParams($scope, function () {
            return $scope.filteredModels;

        });

    });
}());