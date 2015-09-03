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
    App.controller('ManageUsersController', ['$scope', 'UserService',
        'userViewType', 'ngTableParams', 'State', 'UserRoleMapperService', 'UsersListService',
        'UserActionsNotificationsService', 'UserProvider', 'UserView',
        function ($scope, UserService, userViewType, ngTableParams, State,
                  UserRoleMapperService, UsersListService, UserActionsNotificationsService, UserProvider, UserView) {
            $scope.state = new State();
            $scope.viewTypes = UserView;
            $scope.viewType = userViewType;
            $scope.changeTab = function (tab) {
                $scope.tab = tab;
            };

            UserProvider.getUser(function(user){
                $scope.currentUser = user;
            });

            var userService = UserService(userViewType);

            /*jshint latedef: false */
            loadUsers();

            $scope.$on('targetChanged', loadUsers);

            $scope.targetAvailable = userService.targetAvailable;

            $scope.targetType = userService.getTargetType();

            $scope.userToAdd = {};

            $scope.availableRoles = userService.getRoles();

            $scope.roleCheckboxes = {};

            $scope.managersCounter = 0;

            $scope.$watch('users', function() {
                $scope.roleCheckboxes = UserRoleMapperService.mapRolesToCheckboxes($scope.users);
                $scope.countManagers();
            });

            $scope.updateUserRoles = function(user) {
                user.roles = UserRoleMapperService.mapCheckboxesToRoles(user, $scope.roleCheckboxes);

                userService.updateUser(user)
                    .then(function(){
                        UserActionsNotificationsService.userRolesChanged(user);
                    })
                    .catch(UserActionsNotificationsService.userRolesChangeFailed);

                $scope.countManagers();
            };

            $scope.countManagers = function() {
                $scope.managersCounter = _.filter($scope.users, function(userData){
                    return _.contains(userData.roles, 'managers');
                }).length;
            };

            $scope.deleteUser = function(userToBeDeleted) {
                UserActionsNotificationsService.deleteUser(userToBeDeleted, $scope.state, userViewType)
                    .then(function onSuccess() {
                        loadUsers();
                    });
            };

            $scope.addUser = function() {
                $scope.state.setPending();
                var user = UserRoleMapperService.mapSingleRoleToArray($scope.userToAdd);

                userService
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
                        $scope.state.setError();
                    })
                    .then(loadUsers)
                    .then(resetAddUser)
                    .finally(function() {
                        $scope.state.setLoaded();
                    });
            };

            $scope.isCheckboxDisabled = function(avRole, guid, username) {
                return avRole === 'managers' && $scope.roleCheckboxes[guid][avRole] &&
                    ($scope.managersCounter <= 1 || $scope.currentUser.email === username);
            };

            function resetAddUser() {
                $scope.userToAdd = {};
                $scope.changeTab(1);
            }

            function loadUsers() {
                $scope.state.setPending();
                userService
                    .withErrorMessage('Failed to get users list')
                    .getAll()
                    .then(function onSuccess (data) {
                        $scope.users = data;
                        UsersListService.setData(data);
                        if ($scope.tableParams) {
                            $scope.tableParams.page(1);
                            $scope.tableParams.reload();
                        }
                        else {
                            $scope.tableParams = UsersListService.getTableParams();
                        }
                        $scope.state.setLoaded();
                    })
                    .catch(function onError () {
                        $scope.state.setError();
                    });
            }
        }]);
}());
