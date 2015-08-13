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

    var app = angular.module('newAccountApp', []);

    app.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);

    app.controller("newAccountController", ['$scope', '$location', '$http', function ($scope, $location, $http) {
        $scope.user = {};
        var statuses = {
            DEFAULT: 0,
            INCORRECT_CODE: 1,
            CREATED: 2,
            PROCESSING: 3,
            ERROR: 4
        };
        $scope.statuses = statuses;
        $scope.status = statuses.PROCESSING;

        var code = $location.search().code;
        if (!code) {
            $scope.status = statuses.INCORRECT_CODE;
            return;
        } else {
            $http.get('/rest/registrations/' + code)
                .success(function (invitation) {
                    $scope.user.email = invitation.email;
                    $scope.hideorg = !invitation.eligibleToCreateOrg;
                    $scope.status = statuses.DEFAULT;
                })
                .error(function (data, status) {
                    var errorCode = parseInt(status, 10);
                    if (errorCode === 404) {
                        $scope.status = statuses.INCORRECT_CODE;
                    } else {
                        $scope.status = statuses.ERROR;
                        $scope.errorMessage = 'Error ' + errorCode + ': ' + (data || {}).message;
                    }
                });
        }

        $scope.createUser = function () {
            var valid = true,
                validators = $scope.validators;
            for (var validator in validators) {
                if (validators.hasOwnProperty(validator) && !validators[validator]()) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                var user = $scope.user;
                var registration = {
                    password: user.password,
                    org: user.org
                };
                $scope.spinnerText = 'Creating an account for ' + user.email;
                $scope.status = statuses.PROCESSING;

                $http.post('/rest/registrations?code=' + encodeURIComponent(code), registration)
                    .success(function () {
                        $scope.status = statuses.CREATED;
                    })
                    .error(function (data, status) {
                        var errorCode = parseInt(status, 10);
                        switch (errorCode) {
                            case 403:
                                $scope.status = statuses.INCORRECT_CODE;
                                break;
                            case 409:
                                $scope.status = statuses.ERROR;
                                $scope.errorMessage = 'User ' + user.email + ' already exists.';
                                break;
                            default:
                                $scope.status = statuses.ERROR;
                                $scope.errorMessage = 'Error ' + errorCode + ': ' + (data || {}).message;
                                break;
                        }
                    });
            }

        };

        $scope.showTerms = function(){
            $("#termsAndConditionsModal").modal("show");
        };


        $scope.validators = {
            passwordLength: function () {
                var password = $scope.user.password || "";
                return password.length === 0 || password.length >= 6;
            }, passwordMatch: function () {
                return $scope.user.password === $scope.user.passwordRepetition || !$scope.user.passwordRepetition || !$scope.user.password;
            }
        };
    }]);
}());
