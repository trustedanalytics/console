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

    App.factory('ImportDataResource', function (Restangular, targetProvider) {

        var resource = Restangular.service("v1").one("oozie");

        var organization = targetProvider.getOrganization();

        resource.getConfiguration = function () {
            return this.one("configuration").get({org: organization.guid});
        };

        resource.postJob = function(jobData) {
            return this.all('schedule_job').all('coordinated').post(jobData, {org: organization.guid});
        };

        return resource;
    });
}());
