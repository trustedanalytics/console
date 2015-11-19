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
    App.controller('PendingInvitationsController', function ($scope, State, NotificationService,
        PendingInvitationsResource, ngTableParams, $filter) {

        $scope.state = new State();
        $scope.state.setDefault();
        loadInvitations();

        $scope.resend = function (email) {
            $scope.state.setPending();
            PendingInvitationsResource
                .withErrorMessage("Failed to resend invitation email to " + email)
                .resend(email)
                .then(function onResendSuccess() {
                    $scope.state.setLoaded();
                    NotificationService.success("Invitation resent to " + email);
                })
                .catch(function () {
                    $scope.state.setError();
                });
        };

        $scope.delete = function (email) {
            $scope.state.setPending();
            PendingInvitationsResource
                .withErrorMessage("Failed to delete invitation for " + email)
                .delete(email)
                .then(function onResendSuccess() {

                    loadInvitations();
                    $scope.state.setLoaded();
                    NotificationService.success("Invitation deleted");

                })
                .catch(function () {
                    $scope.state.setError();
                });
        };

        function loadInvitations() {
            $scope.state.setPending();
            PendingInvitationsResource
                .withErrorMessage('Failed to get pending invitations')
                .getList()
                .then(function onSuccess(invitations) {
                    $scope.state.setLoaded();
                    $scope.invitations = invitations;
                    if ($scope.tableParams) {
                        $scope.tableParams.page(1);
                        $scope.tableParams.reload();
                    }
                    else {
                        $scope.tableParams = new ngTableParams(
                            {
                                page: 1,
                                count: 20,
                                sorting: {
                                    name: 'asc'
                                }
                            },
                            {
                                total: $scope.invitations.length,
                                getData: function ($defer, params) {
                                    var orderedData = params.sorting() ?
                                        $filter('orderBy')($scope.invitations, params.orderBy()) :
                                        $scope.invitations;
                                    params.total(orderedData.length);

                                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                                }
                            });
                    }
                })
                .catch(function () {
                    $scope.state.setError();
                    NotificationService.error("Error retrieving invitations");
                });
        }
    });
}());
