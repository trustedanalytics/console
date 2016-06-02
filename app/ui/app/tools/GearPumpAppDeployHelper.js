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

    App.factory('GearPumpAppDeployHelper', function (NotificationService, targetProvider, ToolsInstanceResource,
         ServiceKeysResource, GearPumpAppDeployResource, ServiceInstancesMapper, FileUploaderService) {

        var GP_SERVICES_WHITE_LIST = ['hbase', 'kafka', 'zookeeper', 'hdfs'];

        return {
            getGPInstanceCredentialsPromise: getGPInstanceCredentialsPromise,
            getServicesInstancesPromise: getServicesInstancesPromise,
            filterServices: filterServices,
            deployGPApp: deployGPApp,
            setAppArguments: setAppArguments,
            usersArgumentsChange: usersArgumentsChange
        };

        function usersArgumentsChange(appArguments, usersParameters, uploadFormData) {
            appArguments.usersArgs = _.chain(usersParameters)
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
            uploadFormData.appResultantArguments = 'tap=' + angular.toJson(appArguments);
        }

        function setAppArguments(gpInstanceName, $scope, instanceGuid, serviceLabel, appArguments,
                                 ServiceInstancesResource) {
            var keyName = 'gp-app-creds-' + gpInstanceName + '-' + Math.floor(Math.random()*100);
            return ServiceKeysResource
                .withErrorMessage('Adding new service key failed. Check that the service broker supports that feature.')
                .addKey(keyName, instanceGuid)
                .then(function() {
                    return getServicesInstancesPromise(ServiceInstancesResource);
                })
                .then(function success(data) {
                    $scope.services = filterServices(data);
                    var key = findKeyForInstance(instanceGuid, keyName, data);

                    if(!appArguments[serviceLabel]) {
                        appArguments[serviceLabel] = [];
                    }
                    appArguments[serviceLabel].push(ServiceInstancesMapper.getVcapForKey($scope.services, key));

                    return ServiceKeysResource
                        .withErrorMessage('Removing service key failed')
                        .deleteKey(key.guid);
                });
        }

        function deployGPApp (uiInstanceName, gpUiData, uploadFormData) {
            return getGPTokenPromise(uiInstanceName, gpUiData.login, gpUiData.password)
                .then(function() {

                    var data = {
                        configstring: uploadFormData.appResultantArguments
                    };

                    var files = {
                        jar: uploadFormData.jarFile,
                        configfile: uploadFormData.configFile
                    };

                    var url = '/rest/gearpump/' + uiInstanceName + '/api/v1.0/master/submitapp';

                    var uploader = FileUploaderService.uploadFiles(url, data, files, function (response) {
                        return {
                            message: response.status + ': ' + response.data,
                            close: false
                        };
                    });

                    return NotificationService.progress('progress-upload', uploader);
                });
        }

        function getGPInstanceCredentialsPromise(instanceName) {
            var orgId = targetProvider.getOrganization().guid,
                spaceId = targetProvider.getSpace().guid;
            return ToolsInstanceResource.getToolsInstances(orgId, spaceId, 'gearpump')
                .then(function (response) {
                    var result = response.plain();
                    return result[instanceName];
                });
        }

        function getGPTokenPromise(gpInstance, username, password) {
            return GearPumpAppDeployResource.getGPToken(gpInstance, username, password);
        }

        function getServicesInstancesPromise(ServiceInstancesResource) {
            if (targetProvider.getSpace().guid) {
                return ServiceInstancesResource
                    .withErrorMessage('Error loading service keys')
                    .getSummary(targetProvider.getSpace().guid, true);
            }
        }

        function filterServices(data, whiteList) {
            whiteList = whiteList || GP_SERVICES_WHITE_LIST;
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
                .findWhere({
                    guid: instanceGuid
                })
                .value();
            return _.findWhere(instance.service_keys, {
                name: keyName
            });
        }
    });
}());
