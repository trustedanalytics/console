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

    App.controller('UploadDataSetController', function ($scope, DasResource, State, categoriesIcons,
        NotificationService, Upload, targetProvider, UploaderConfig, FileUploaderService) {

        var self = this;

        self.getInitData = UploaderConfig;

        $scope.uploadFormData = self.getInitData();
        $scope.fileSizeLimit = 0;
        $scope.fileBlackListTypes = [];
        $scope.state = new State().setLoaded();

        $scope.input = "link";

        self.clearInput = function () {
            $scope.uploadFormData = self.getInitData();
            $scope.inputFile = null;
        };

        $scope.submitDownload = function () {
            $scope.state.setPending();
            if ($scope.uploadFormData.input.type === 'link') {
                DasResource
                    .withErrorMessage('Error when sending link')
                    .postTransfer({
                        source: $scope.uploadFormData.link,
                        category: $scope.uploadFormData.category,
                        title: $scope.uploadFormData.title
                    }, $scope.uploadFormData.public)
                    .then(function onSuccess() {
                        $scope.state.setLoaded();
                        NotificationService.success('Link has been sent');
                        self.clearInput();
                    }).catch(function onError() {
                    $scope.state.setError();
                });
            } else {

                var data = {
                    orgUUID: targetProvider.getOrganization().guid,
                    category: $scope.uploadFormData.category,
                    title: $scope.uploadFormData.title,
                    publicRequest: $scope.uploadFormData.public
                };

                var files = {
                    file: $scope.uploadFormData.filename
                };

                var url = '/rest/upload/' + targetProvider.getOrganization().guid;

                var uploader = FileUploaderService.uploadFiles(url, data, files, function (response) {
                    var message = response.status + ': ' + (response.data ? response.data.message : '');

                    NotificationService.error(message);
                    return {
                        message: message,
                        close: true
                    };
                });

                NotificationService.progress('progress-upload', uploader)
                    .then(function() {
                        self.clearInput();
                        $scope.state.setLoaded();
                    });
            }
        };

        $scope.inputChange = function() {
            if($scope.uploadFormData.input.type === 'local') {
                $scope.uploadFormData.link = "";
            } else {
                $scope.uploadFormData.filename = "";
            }
        };

        $scope.getIcon = function (category) {
            return categoriesIcons[category] || categoriesIcons.other;
        };

        $scope.setCategory = function (c) {
            $scope.uploadFormData.category = c;
        };
    });

}());
