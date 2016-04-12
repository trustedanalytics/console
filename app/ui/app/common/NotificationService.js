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

    App.factory('NotificationService', function ($q, ngDialog, toaster) {
        return {
            confirm: function confirm(templateId, data) {
                var deferred = $q.defer();
                ngDialog.open(
                    {
                        template: templateId,
                        controller: /*@ngInject*/ function ($scope) {
                            $scope.data = data;
                            $scope.confirm = function () {
                                deferred.resolve(arguments);

                                $scope.closeThisDialog();
                            };
                            $scope.cancel = function () {
                                $scope.closeThisDialog();
                            };
                        }
                    });
                return deferred.promise;
            },

            success: function success(message, title) {
                toaster.pop({
                    type: 'success',
                    title: title,
                    body: message,
                    toasterId: 'top-right'
                });
            },

            warning: function warning(message, title) {
                toaster.pop({
                    type: 'warning',
                    title: title,
                    body: message,
                    toasterId: 'top-right'
                });
            },

            error: function error(message, title) {
                var config = {
                    type: 'error',
                    timeout: 0,
                    toasterId: 'full-width'
                };

                if (_.isObject(message)) {
                    config = _.extend(config, message);
                } else {
                    config.body = message;
                    config.title = title;
                }

                toaster.pop(config);
            },

            genericError: function (error, message) {
                if(_.isString(error) && !message) {
                    message = error;
                    error = {};
                }
                error = _.extend({
                    customMessage: message
                }, error);

                this.error({
                    bodyOutputType: 'templateWithData',
                    body: "{template: 'generic-error-template', data: " + angular.toJson(error) + "}"
                });
            },

            progress: function progress(templateId, data) {
                var deferred = $q.defer();
                ngDialog.open(
                    {
                        template: templateId,
                        showClose: false,
                        closeByEscape: false,
                        closeByDocument: false,
                        controller: ['$scope', function ($scope) {
                            $scope.data = data;
                            $scope.ok = function () {
                                deferred.resolve(arguments);
                                $scope.closeThisDialog();
                            };
                            $scope.$on('closeDialog', function() {
                                $scope.ok();
                            });
                        }]
                    });
                return deferred.promise;
            },

            info: function info(templateId) {
                var dialog = ngDialog.open(
                    {
                        template: templateId,
                        controller: /*@ngInject*/ function ($scope) {
                            $scope.confirm = function () {
                                $scope.closeThisDialog();
                            };
                        }
                    });
                return dialog.closePromise;
            }
        };
    });

}());
