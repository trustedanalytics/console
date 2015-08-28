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

    App.controller('UploadDataSetController', ['$scope', 'DasResource', 'State', 'categoriesIcons',
        'NotificationService', 'FileUploader', 'targetProvider',
        function ($scope, DasResource, State, categoriesIcons, NotificationService, FileUploader, targetProvider) {
            var self = this;

            $scope.state = new State();

            $scope.category = "other";

            $scope.public = false;

            $scope.categories = [
                'agriculture',
                'business',
                'climate',
                'consumer',
                'ecosystems',
                'education',
                'energy',
                'finance',
                'health',
                'manufacturing',
                'science',
                'other'
            ];

            self.clearInput = function () {
                $scope.link = "";
                $scope.file = "";
                $scope.category = "";
                $scope.title = "";
                $scope.public = "";
            };

            $scope.uploader = new FileUploader({
                url: "/rest/upload/" + targetProvider.getOrganization().guid,
                onBeforeUploadItem: function (item){
                    item.formData.push({
                        orgUUID: targetProvider.getOrganization().guid,
                        category: $scope.category,
                        title: $scope.title,
                        publicRequest: $scope.public
                    });
                }
            });

            $scope.submitDownload = function () {

                $scope.state.setPending();
                if($scope.input === 'link') {
                    DasResource
                        .withErrorMessage('Error when sending link')
                        .postTransfer({"source": $scope.link, "category": $scope.category, "title": $scope.title}, $scope.public)
                        .then(function onSuccess() {
                            $scope.state.setLoaded();
                            NotificationService.success('Link has been sent');
                            self.clearInput();
                        }).catch(function onError() {
                            $scope.state.setError();
                        });
                } else {
                    $scope.uploader.queue[0].upload();
                    NotificationService.progress('progress-upload', {uploader : $scope.uploader})
                        .then(function () {
                            $scope.state.setLoaded();
                            self.clearInput();
                        }).catch(function onError() {
                            $scope.state.setError();
                        });
                }
            };

            $scope.getIcon = function (category) {
                return categoriesIcons[category] || categoriesIcons.other;
            };

            $scope.setCategory = function(c) {
                $scope.category = c;
            };
        }]);

}());
