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

    /*jshint newcap: false*/
    App.controller('ChangePasswordController', ['$scope', 'UserProvider', 'State', 'NotificationService', '$state',
        function ($scope, UserProvider, State, NotificationService, $state) {
            $scope.state = new State().setLoaded();
            $scope.oldPassword = '';
            $scope.newPassword = '';
            $scope.newPasswordConfirmation = '';

            $scope.changePassword = function () {
                $scope.state.setPending();
                UserProvider
                    .supressGenericError()
                    .updatePassword($scope.oldPassword, $scope.newPassword)
                    .then(passwordUpdated)
                    .catch(errorInfo);
            };

            function passwordUpdated() {
                $state.go('app.dashboard');
                NotificationService.success('Your password has been changed. Please provide new password on next logon.');
            }

            function errorInfo(response) {
                var errorMessages = {
                    500: 'Server error',
                    401: 'You are not authorized to perform this action',
                    404: 'User not found',
                    405: 'Operation not allowed'
                };
                NotificationService.genericError(response.data, _.result(errorMessages, response.status,
                    'Error resetting password'));
            }
        }
    ]);
}());
