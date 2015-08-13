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

    App.factory('spaceUserService', ['Restangular', 'targetProvider', '$q',
        function (Restangular, targetProvider, $q) {
            var service = Restangular.service("spaces");

            function getSpaceId() {
                return (targetProvider.getSpace() || {}).guid;
            }

            function getOrgId() {
                return (targetProvider.getOrganization() || {}).guid;
            }

            function getUsersResource() {
                return service.one(getSpaceId()).all("users");
            }

            service.getAll = function() {
                if (getSpaceId()) {
                    return getUsersResource().getList();

                }
                else {
                    var deferred = $q.defer();
                    deferred.reject();
                    return deferred.promise;
                }
            };

            service.targetAvailable = function () {
                return typeof getSpaceId() !== 'undefined';
            };
            service.getTargetType = function () {
                return "spaces";
            };

            service.addUser = function(user) {
                user.org_guid = getOrgId();
                return getUsersResource().post(user);
            };

            service.updateUser = function(user) {
                user.org_guid = getOrgId();
                return getUsersResource().one(user.guid).customPUT(user);
            };

            service.getRoles = function() {
                return {
                    "managers": "Space Manager",
                    "auditors": "Space Auditor",
                    "developers": "Space Developer"
                };
            };

            service.deleteUser = function(userId) {
                return getUsersResource().one(userId).remove();
            };

            return service;
        }]);
}());
