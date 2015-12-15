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

    App.factory('FileUploaderService', function (targetProvider, FileUploader, NotificationService, UploadResource) {

        var fileSizeLimit = null;
        var fileBlackListTypes = [];
        var uploadEnvsPromise = UploadResource.getUploadEnvs().then(function onSuccess(configData) {
            fileSizeLimit = configData.file_size_limit;
            fileBlackListTypes = configData.file_black_list_types;
        });

        return {

            createFileUploader: function (formData) {
                var MEGA_BYTE_SIZE = 1024 * 1024;
                var uploader = new FileUploader({
                    url: "/rest/upload/" + targetProvider.getOrganization().guid,
                    onBeforeUploadItem: function (item) {
                        item.formData.push({
                            orgUUID: targetProvider.getOrganization().guid,
                            category: formData.category,
                            title: formData.title,
                            publicRequest: formData.public
                        });
                        item.timeStart = Date.now();
                        item.prevProgress = 0;
                        item.uploadedSize = 0;
                    },
                    filters: [{
                        name: 'sizeFilter',
                        onError: 'Size of selected file is too large.',
                        fn: function (item) {
                            return item.size <= fileSizeLimit * MEGA_BYTE_SIZE;
                        }
                    },
                        {
                            name: 'typeFilter',
                            fn: function (item) {
                                if(_.contains(fileBlackListTypes, item.type)) {
                                    NotificationService.warning('Selected file may be not supported by analytics tools. ' +
                                        'Please make sure you want to proceed with the upload.');
                                }
                                return true;
                            }
                        }],

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
                    onWhenAddingFileFailed: function (item, filter) {
                        NotificationService.error(filter.onError);
                    }
                });

                return uploadEnvsPromise.then(function () {
                    return uploader;
                });
            }
        };


    });
}());