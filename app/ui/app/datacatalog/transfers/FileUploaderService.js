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

    App.factory('FileUploaderService', function (Upload, $rootScope) {

        return {
            uploadFiles: function (url, data, files, errorFunction) {
                var uploaderData = {};
                var timeStart = Date.now();
                var MEGA_BYTE = 1024 * 1024;

                var filesSize = _.reduce(files, function (memo, file) {
                    return memo + (file ? file.size : 0);
                }, 0);

                angular.extend(data, files);

                var uploader = Upload.upload({
                    url: url,
                    data: data
                });

                uploaderData.abort = uploader.abort;

                uploader.then(function (response) {
                    uploaderData.response = response.data;
                    uploaderData.status = response.status;
                }, function (response) {
                    uploaderData.error = errorFunction(response);
                    if(uploaderData.error.close){
                        $rootScope.$broadcast('closeDialog');
                    }
                }, function (evt) {
                    uploaderData.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));

                    var time = Date.now() - timeStart;
                    var uploadedSize = uploaderData.progress * filesSize / 100;
                    var speed = uploadedSize / (time / 1000);
                    uploaderData.speed = (speed / MEGA_BYTE).toFixed(1);
                    uploaderData.timeLeft = (filesSize - uploadedSize) / speed;

                    if (_.isNaN(uploaderData.timeLeft) || !_.isFinite(uploaderData.timeLeft)) {
                        uploaderData.timeLeft = 0;
                        uploaderData.speed = null;
                    }
                });

                return uploaderData;
            }
        };

    });
}());