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

    App.controller('GearPumpAppDeployController', function ($scope, $window, $location, targetProvider,
        FileUploader, State, NotificationService, GearPumpAppDeployResource, ToolsInstanceResource) {

        $scope.state = new State();
        $scope.gpInstanceName = $location.path().split('/').pop();

        getGPInstanceCredentialsPromise(ToolsInstanceResource, targetProvider.getOrganization().guid, targetProvider.getSpace().guid, $scope.gpInstanceName)
            .then(function(creds) {
                if(!creds) {
                    $scope.state.setError();
                } else {
                    $scope.gpUiData = creds;
                    $scope.uiInstanceName = creds.hostname.split(".").slice(0, 1)[0];
                    $scope.state.setLoaded();
                }
            });

        $scope.uploader = createFileUploader(FileUploader, function() {
            return $scope.uiInstanceName;
        }, function() {
            return $scope.uploadFormData ? $scope.uploadFormData.appArguments : "";
        });

        $scope.deployGPApp = function() {
            $scope.state.setPending();
            getGPTokenPromise(GearPumpAppDeployResource, $scope.uiInstanceName, $scope.gpUiData.login, $scope.gpUiData.password)
                .then(function() {
                    $scope.uploader.queue[0].upload();
                    return NotificationService.progress('progress-upload', {uploader: $scope.uploader});
                })
                .then(function() {
                    if($scope.uploader.spawnedAppId) {
                        $window.open('https://' + $scope.gpUiData.hostname + '/#/apps/streamingapp/'
                                        + $scope.uploader.spawnedAppId, '_blank');
                    }
                    $scope.clearForm();
                    $scope.state.setLoaded();
                }).catch(function onError() {
                    $scope.state.setError();
                });
        };

        $scope.clearForm = function() {
            $scope.uploadFormData.filename = '';
            angular.element("input[name='upfile']").val(null);
            $scope.uploadFormData.appArguments = '';
            $scope.uploader.errorMessage = '';
            $scope.uploader.spawnedAppId = '';
            $scope.uploader.clearQueue();
        }
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

    function createFileUploader(FileUploader, getUiInstance, urlArguments) {
        var MEGA_BYTE_SIZE = 1024 * 1024;
        var urlBase = ["/rest/gearpump/", "/api/v1.0/master/submitapp", "?args="];

        return new FileUploader({
            alias: "jar",
            queueLimit: 2,
            onBeforeUploadItem: function (item) {
                item.formData.push(Object());
                item.timeStart = Date.now();
                item.prevProgress = 0;
                item.uploadedSize = 0;
                item.url = urlBase[0] + getUiInstance() + urlBase[1] + (urlArguments() ? urlBase[2] + urlArguments() : "");
            },
            onProgressItem: function (item, progress) {
                var time = Date.now() - item.timeStart;
                item.uploadedSize = progress * item.file.size / 100;
                var speed = (item.uploadedSize / MEGA_BYTE_SIZE) / (time / 1000);
                item.speed = speed.toFixed(1);
                item.timeLeft = ((item.file.size - item.uploadedSize) / MEGA_BYTE_SIZE) / speed;

                if (_.isNaN(item.timeLeft) || !_.isFinite(item.timeLeft)) {
                    item.timeLeft = 0;
                    item.speed = null;
                }
            },
            onSuccessItem: function (item, response, status, headers) {
                this.spawnedAppId = response.appId;
            },
            onErrorItem: function (item, response, status, headers) {
                this.errorMessage = response;
            }
        });
    }
}());