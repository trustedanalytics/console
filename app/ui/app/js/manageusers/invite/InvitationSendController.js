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

    App.controller('InvitationSendController', function ($http, $scope, State, NotificationService) {
        $scope.state = new State();
        $scope.state.setDefault();

        $scope.sendInvitation = function () {
            var invitation = {
                email: $scope.email,
                eligibleToCreateOrg: true
            };
            $scope.spinnerText = 'Sending an invitation';
            $scope.state.setPending();

            $http.post('/rest/invitations', invitation)
                .success(function (response) {
                    $scope.invitationState = response.state;
                    $scope.details = response.details;
                    $scope.state.setLoaded();
                    if ($scope.invitationState === 'NEW') {
                        NotificationService.success('Invitation sent');
                    }
                }).error(function (response, status) {
                $scope.invitationState = response.state;
                var errorCode = parseInt(status, 10);
                if (errorCode === 403) {
                    $scope.details = "You do not have permission to invite new users";
                } else {
                    $scope.details = response.error;
                }
                $scope.state.setError();
                NotificationService.error($scope.details);
            });
        };

        $scope.reset = function () {
            $scope.email = '';
            $scope.state.setDefault();
        };
    });
}());
