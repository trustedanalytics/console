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

    App.factory('orgUserService', function (Restangular, targetProvider, $q) {
        var service = Restangular.service("orgs");

        function getOrgId() {
            return (targetProvider.getOrganization() || {}).guid;
        }

        function getUsersResource() {
            return service.one(getOrgId()).all("users");
        }

        service.getAll = function () {
            if (getOrgId()) {
                return getUsersResource().getList();
            }
            else {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            }
        };

        service.targetAvailable = function () {
            return typeof getOrgId() !== 'undefined';
        };

        service.getTargetType = function () {
            return "organizations";
        };

        service.addUser = function (user) {
            return getUsersResource().post(user);
        };

        service.updateUserRoles = function (user) {
            return getUsersResource().one(user.guid).customPOST({roles: user.roles});
        };

        service.getRoles = function () {
            return {
                "managers": "Org Manager",
                "auditors": "Org Auditor",
                "billing_managers": "Billing Manager"
            };
        };

        service.deleteUser = function (userId) {
            return getUsersResource().one(userId).remove();
        };

        return service;
    });
}());
