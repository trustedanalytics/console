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

(function() {
    'use strict';

    App.factory('ManageUsersHelper', function (UserActionsNotificationsService, UserRoleMapperService) {

        return {
            updateUserRoles: updateUserRoles,
            countManagers: countManagers,
            addUser: addUser
        };

        function addUser(userToAdd, userService) {
            var user = UserRoleMapperService.mapSingleRoleToArray(userToAdd);

            return userService
                .withErrorMessage('Failed to add user')
                .addUser(user)
                .then(function onSuccess(data) {
                    if (data != null) {
                        UserActionsNotificationsService.userAdded(user);
                    } else {
                        UserActionsNotificationsService.userInvited(user);
                    }
                })
                .catch(function onError() {
                    UserActionsNotificationsService.userNotAdded(user);
                });
        }

        function countManagers(users) {
            return _.filter(users, function (userData) {
                return _.contains(userData.roles, 'managers');
            }).length;
        }

        function updateUserRoles(user, roleCheckboxes, users, userService) {
            user.roles = UserRoleMapperService.mapCheckboxesToRoles(user, roleCheckboxes);

            userService.updateUserRoles(user)
                .then(function () {
                    UserActionsNotificationsService.userRolesChanged(user);
                })
                .catch(UserActionsNotificationsService.userRolesChangeFailed);
            return countManagers(users);
        }
    });
}());