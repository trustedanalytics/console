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

    App.factory('ServiceInstanceResource', function (Restangular) {
        var service = Restangular.service("service_instances");

        service.createInstance = function (name, planGuid, orgGuid, spaceGuid, params) {
            var parameters = _.extend({}, params, {
                name: name
            });
            return this.post({
                name: name,
                service_plan_guid: planGuid,
                organization_guid: orgGuid,
                space_guid: spaceGuid,
                parameters: parameters
            });
        };

        service.deleteInstance = function (serviceId) {
            return this.one(serviceId).remove();
        };

        service.getAllByType = function (spaceId, serviceId) {
            return this.getList({
                space: spaceId,
                broker: serviceId
            });
        };

        service.getAll = function (spaceId) {
            return this.getList({
                space: spaceId
            });
        };

        service.getById = function (instanceId) {
            return this.one(instanceId).get();
        };

        return service;
    });
}());
