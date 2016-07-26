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

    App.factory('ToolsInstanceResource', function (Restangular) {
        var service = Restangular.service("tools/service_instances");

        service.getToolsInstances = function (orgId, spaceId, serviceType) {
            return this.one().get({
                org: orgId,
                space: spaceId,
                service: serviceType
            });
        };

        service.getServiceInstance = function (instanceId) {
            return this.one(instanceId).get();
        };

        return service;
    });


}());
