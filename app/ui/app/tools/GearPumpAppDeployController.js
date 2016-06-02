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

    App.controller('GearPumpAppDeployController', function ($scope, $window, $location, State,
        ServiceInstancesResource, GearPumpAppDeployHelper) {

        var appArguments = {};

        $scope.uploadFormData = {};
        $scope.uploadData = {};
        $scope.usersParameters = [];
        $scope.state = new State().setPending();
        $scope.instancesState = new State().setPending();
        $scope.gpInstanceName = $location.path().split('/').pop();

        GearPumpAppDeployHelper.getGPInstanceCredentialsPromise($scope.gpInstanceName)
            .then(function(creds) {
                if(creds) {
                    $scope.gpUiData = creds;
                    $scope.uiInstanceName = creds.hostname.split(".").slice(0, 1)[0];
                    $scope.state.setLoaded();
                } else {
                    $scope.state.setError();
                }
            });

        GearPumpAppDeployHelper.getServicesInstancesPromise(ServiceInstancesResource)
            .then(function success(data) {
                $scope.services = GearPumpAppDeployHelper.filterServices(data);
                $scope.instancesState.setLoaded();
            });

        $scope.$watchCollection('usersParameters', function () {
            $scope.usersArgumentsChange();
        });

        $scope.instanceCheckboxChange = function (instanceGuid, serviceLabel, instanceName) {
            if($scope.uploadFormData.instances[instanceGuid]) {
                $scope.instancesState.setPending();
                $scope.setAppArguments(instanceGuid, serviceLabel)
                    .then(function success() {
                        $scope.uploadFormData.appResultantArguments = 'tap=' + angular.toJson(appArguments);
                    })
                    .catch(function() {
                        $scope.uploadFormData.instances[instanceGuid] = false;
                    })
                    .finally(function() {
                        $scope.instancesState.setLoaded();
                    });
            } else {
                appArguments[serviceLabel] = _.filter(appArguments[serviceLabel], function(value) {
                    return value.name !== instanceName;
                });
                if(_.isEmpty(appArguments[serviceLabel])) {
                    delete appArguments[serviceLabel];
                }
                $scope.uploadFormData.appResultantArguments = 'tap=' + angular.toJson(appArguments);
            }
        };

        $scope.setAppArguments = function (instanceGuid, serviceLabel){
            return GearPumpAppDeployHelper.setAppArguments($scope.gpInstanceName, $scope, instanceGuid, serviceLabel, appArguments,
                ServiceInstancesResource);
        };

        $scope.usersArgumentsChange = function () {
            GearPumpAppDeployHelper.usersArgumentsChange(appArguments, $scope.usersParameters, $scope.uploadFormData);
        };

        $scope.addExtraParam = function () {
            $scope.usersParameters.push({key:null, value:null});
        };

        $scope.removeExtraParam = function (param) {
            $scope.usersParameters = _.without($scope.usersParameters, param);
        };

        $scope.deployGPApp = function() {
            $scope.state.setPending();
            GearPumpAppDeployHelper.deployGPApp($scope.uiInstanceName, $scope.gpUiData, $scope.uploadFormData)
                .finally(function() {
                    $scope.clearForm();
                    $scope.state.setLoaded();
                });
        };

        $scope.clearForm = function() {
            $scope.uploadFormData.jarFile = '';
            $scope.uploadFormData.configFile = '';
            angular.element("input[name='upfile']").val(null);
            $scope.uploadFormData.appResultantArguments = 'tap={}';
            $scope.uploadFormData.usersArguments = '';
            $scope.uploadFormData.instances = {};
            $scope.usersParameters = [];
            appArguments = {};
        };
    });
}());
