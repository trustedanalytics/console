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

    App.controller('GearPumpAppDeployController', function ($scope, $window, $location, targetProvider, Upload, State, ServiceInstancesMapper,
        NotificationService, GearPumpAppDeployResource, ToolsInstanceResource, ServiceKeysResource, ServiceInstancesResource) {

        var GP_SERVICES_WHITE_LIST = ['hbase', 'kafka', 'zookeeper', 'hdfs'];

        var appArguments = {};

        $scope.uploadFormData = {};
        $scope.uploadData = {};
        $scope.usersParameters = [];
        $scope.state = new State().setPending();
        $scope.instancesState = new State().setPending();
        $scope.gpInstanceName = $location.path().split('/').pop();

        getGPInstanceCredentialsPromise(ToolsInstanceResource, targetProvider.getOrganization().guid, targetProvider.getSpace().guid, $scope.gpInstanceName)
            .then(function(creds) {
                if(creds) {
                    $scope.gpUiData = creds;
                    $scope.uiInstanceName = creds.hostname.split(".").slice(0, 1)[0];
                    $scope.state.setLoaded();
                } else {
                    $scope.state.setError();
                }
            });

        getServicesInstancesPromise(ServiceInstancesResource, targetProvider)
            .then(function success(data) {
                $scope.services = filterServices(data, GP_SERVICES_WHITE_LIST);
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
                        $scope.uploadFormData.appResultantArguments = angular.toJson(appArguments);
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
                $scope.uploadFormData.appResultantArguments = angular.toJson(appArguments);
            }
        };

        $scope.setAppArguments = function (instanceGuid, serviceLabel){
            var keyName = 'gp-app-creds-' + $scope.gpInstanceName + '-' + Math.floor(Math.random()*100);
            return ServiceKeysResource
                .withErrorMessage('Adding new service key failed. Check that the service broker supports that feature.')
                .addKey(keyName, instanceGuid)
                .then(function() {
                    return getServicesInstancesPromise(ServiceInstancesResource, targetProvider);
                })
                .then(function success(data) {
                    $scope.services = filterServices(data, GP_SERVICES_WHITE_LIST);
                    var key = findKeyForInstance(instanceGuid, keyName, data);

                    if(!appArguments[serviceLabel]) {
                        appArguments[serviceLabel] = [];
                    }
                    appArguments[serviceLabel].push(ServiceInstancesMapper.getVcapForKey($scope.services, key));

                    return ServiceKeysResource
                        .withErrorMessage('Removing service key failed')
                        .deleteKey(key.guid);
                });
        };

        $scope.usersArgumentsChange = function () {
            appArguments.usersArgs = _.chain($scope.usersParameters)
                .filter(function (parameter) {
                    return parameter.key;
                })
                .map(function(element) {
                    return [element.key, element.value];
                })
                .object()
                .value();

            if(angular.equals(appArguments.usersArgs, {})) {
                delete appArguments.usersArgs;
            }
            $scope.uploadFormData.appResultantArguments = 'tap=' + angular.toJson(appArguments);
        };

        $scope.addExtraParam = function () {
            $scope.usersParameters.push({key:null, value:null});
        };

        $scope.removeExtraParam = function (param) {
            $scope.usersParameters = _.without($scope.usersParameters, param);
        };

        $scope.deployGPApp = function() {
            $scope.state.setPending();
            getGPTokenPromise(GearPumpAppDeployResource, $scope.uiInstanceName, $scope.gpUiData.login, $scope.gpUiData.password)
                .then(function() {
                    var uploader = uploadFiles(Upload, $scope.uploadFormData.jarFile, $scope.uploadFormData.configFile,
                        $scope.uiInstanceName, $scope.uploadFormData.appResultantArguments);

                    return NotificationService.progress('progress-upload', uploader);
                }).finally(function() {
                    $scope.clearForm();
                    $scope.state.setLoaded();
                });
        };

        $scope.clearForm = function() {
            $scope.uploadFormData.filename = '';
            angular.element("input[name='upfile']").val(null);
            $scope.uploadFormData.appResultantArguments = '';
            $scope.uploadFormData.usersArguments = '';
            $scope.uploadFormData.instances = {};
            $scope.usersParameters = [];
            appArguments = {};
        };
    });


    function getGPInstanceCredentialsPromise(ToolsInstanceResource, orgId, spaceId, instanceName) {
        return ToolsInstanceResource.getToolsInstances(orgId, spaceId, 'gearpump')
            .then(function (response) {
                var result = response.plain();
                return result[instanceName];
            });
    }

    function getGPTokenPromise(GearPumpAppDeployResource, gpInstance, username, password) {
        return GearPumpAppDeployResource.getGPToken(gpInstance, username, password);
    }

    function uploadFiles(Upload, jarFile, configFile, uiInstance, parameters) {
        var urlBase = ["/rest/gearpump/", "/api/v1.0/master/submitapp"];
        var uploaderData = {};

        Upload.upload({
            url: urlBase[0] + uiInstance + urlBase[1],
            data: {
                jar: jarFile,
                configfile: configFile,
                configstring: parameters
            }
        })
        .then(function (response) {
            uploaderData.response = response.data;
            uploaderData.status = response.status;
        }, function (response) {
            uploaderData.error = response.status + ': ' + response.data;
        }, function (evt) {
            uploaderData.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });

        return uploaderData;
    }

    function getServicesInstancesPromise(ServiceInstancesResource, targetProvider) {
        if (targetProvider.getSpace().guid) {
            return ServiceInstancesResource
                .withErrorMessage('Error loading service keys')
                .getSummary(targetProvider.getSpace().guid, true);
        }
    }

    function filterServices(data, whiteList) {
        var mapped = _.map(data, function (service) {
            var extra = JSON.parse(service.extra || '{}');
            return _.extend({}, service, extra);
        });

        return _.filter(mapped, function (service) {
            return _.contains(whiteList, service.label);
        });
    }

    function findKeyForInstance(instanceGuid, keyName, data) {
        var instance = _.chain(data)
            .pluck('instances')
            .flatten(true)
            .findWhere({guid: instanceGuid})
            .value();
        return _.findWhere(instance.service_keys, {name: keyName});
    }
}());