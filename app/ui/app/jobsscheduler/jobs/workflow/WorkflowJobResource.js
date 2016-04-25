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

    App.factory('WorkflowJobResource', function (Restangular) {

        var resource = Restangular.service("v1").one("oozie").one("jobs");

        resource.getJobs = function(guid, unit, amount){
            return this.one("workflow").get({org: guid, unit: unit, amount: amount});
        };

        resource.getJob = function (id, guid) {
            return this.one("workflow").one(id).get({org: guid});
        };

        resource.getLogs = function (id, guid) {
            return this.one(id).one("logs").get({org: guid});
        };

        resource.changeJobStatus = function (id, action) {
            return this.one(id).one('manage').put({action: action});
        };

        return resource;


    });

}());
