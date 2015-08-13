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

    App.factory('ApplicationResource', ['Restangular',
        function (Restangular) {
            var service = Restangular.service("apps");

            service.deleteApplication = function (id, cascade) {
                return this.one(id).remove({cascade: cascade});
            };

            service.getAll = function(spaceId){
                return this.getList({ space: spaceId });
            };

            service.getAllByServiceType = function(spaceId, serviceLabel){
                return this.getList({ space: spaceId, service_label: serviceLabel});
            };

            service.getApplication = function (id) {
                return this.one(id).get();
            };

            service.postStatus = function(appId, status) {
                return this.one(appId).all("status").post(status);
            };

            service.createBinding = function (appId, serviceId) {
                return this.one(appId).all("service_bindings").post({service_instance_guid: serviceId});
            };

            service.getAllBindings = function(appId) {
                return this.one(appId).all("service_bindings").customGET("");
            };

            service.getOrphanServices = function(appId) {
                return this.one(appId).all("orphan_services").customGET("");
            };

            return service;
        }]);
}());
