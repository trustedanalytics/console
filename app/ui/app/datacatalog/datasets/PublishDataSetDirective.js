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

    var modes = Object.freeze({
        UNIFIED: 'unified',
        SEPARATE: 'separate'
    });

    var tools = Object.freeze({
        HUE: 'hue',
        ARCADIA: 'arcadia'
    });

    App.directive('dPublishDataSet', function (DataTableResource, State, $window, ngDialog, PlatformContextProvider) {
        return {
            scope: {
                dataSet: "=data",
                mode: "@?",
                tool: "=?"
            },
            controller: ['$scope', function ($scope) {
                var publishDialog;

                var state = new State().setDefault();
                $scope.state = state;

                $scope.mode = $scope.mode || modes.UNIFIED;
                $scope.modes = modes;

                $scope.tool = $scope.tool || tools.ARCADIA;
                $scope.tools = tools;

                $scope.availableVisualizationsTools =[];

                PlatformContextProvider.getPlatformContext().then(function (data) {
                    var externalTools = data.external_tools;
                    $scope.availableVisualizationsTools = _.pluck(_.where(externalTools.visualizations, {available: true}), 'name').map(function (name) {
                        return name.toLowerCase();
                    });
                });

                $scope.isToolAvailable = function (toolName) {
                    return _.contains($scope.availableVisualizationsTools, toolName.toLowerCase());
                };

                $scope.publish = function (tool) {
                    if (!tool) {
                        tool = $scope.tool;
                    }

                    state.setPending();
                    publishDialog = ngDialog.open(
                        {
                            template: "publish-modal",
                            closeByEscape: false,
                            closeByDocument: false
                        });
                    DataTableResource
                        .withErrorMessage('Publish of the data set failed')
                        .publish($scope.dataSet)
                        .then(function onSucces(data) {
                            $window.open(data[tool + '_url'], '_blank');
                        })
                        .catch(function onError() {
                            state.setError();
                        })
                        .finally(function() {
                            publishDialog.close();
                        });
                };
            }],
            templateUrl: 'app/datacatalog/datasets/publishDataSet.html'
        };
    });
}());
