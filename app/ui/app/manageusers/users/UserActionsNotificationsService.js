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
    App.service('UserActionsNotificationsService', function ($controller, $q, NotificationService, UserService) {

        return {

            deleteUser: function (user, state, userViewType) {
                return NotificationService.confirm('confirm-delete', {userToDelete: user, userViewType: userViewType})
                    .then(function onConfirmDelete() {
                        state.setPending();
                        var userId = user.guid;
                        return UserService(userViewType).deleteUser(userId);
                    })
                    .then(function () {
                        NotificationService.success('User ' + user.username + ' has been deleted');

                    })
                    .catch(function onError(response) {
                        NotificationService.error(response.data.message || 'Error deleting user');
                    })
                    .finally(function () {
                        state.setLoaded();
                    });

            },

            userAdded: function (user) {
                NotificationService.success('User ' + user.username + ' has been added');
            },

            userNotAdded: function (user) {
                NotificationService.error('User ' + user.username + ' has not been added');
            },

            userInvited: function (user) {
                NotificationService.success('User ' + user.username + ' does not exist. The user has been invited');
            },

            userRolesChangeFailed: function () {
                NotificationService.error('User role has not been updated');
            },

            userRolesChanged: function (user) {
                NotificationService.success(user.username + ' role has been updated');
            }

        };
    });
}());
