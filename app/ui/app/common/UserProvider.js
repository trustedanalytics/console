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

    App.factory('UserProvider', function (Restangular) {
        var service = Restangular.service("users");
        var userPromise = null;
        service.getUser = function() {
            if(userPromise == null) {
                userPromise = service.one("current").get();
            }
            return userPromise;
        };

        service.updatePassword = function (oldPassword, newPassword) {
            var data = {
                oldPassword: oldPassword,
                password: newPassword
            };

            return service.one("current").one("password").customPUT(data);
        };

        service.isAdmin = function () {
            return service.getUser()
                .then(function(user) {
                    return user.role === 'ADMIN';
                });
        };

        service.isAnyOrgManager = function(organizations) {
            return _.some(organizations, function(org) {
                return org.manager;
            });
        };

        return service;
    });
}());
