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

    App.factory('ServiceInstancesMapper', function () {
        var service = {};

        service.getVcapConfiguration = function(services, keys) {
            return _.reduce(_.map(keys, _.partial(this.getVcapForKey, services)), function (memo, vcap) {
                if (memo[vcap.label]) {
                    memo[vcap.label].push(vcap);
                } else {
                    memo[vcap.label] = [vcap];
                }
                return memo;
            }, {});
        };

        service.getVcapForKey = function(services, key) {
            var service = _.find(services, function (s) {
                return _.findWhere(s.instances, {guid: key.service_instance_guid});
            });
            var instance = _.findWhere(service.instances, {guid: key.service_instance_guid});
            return {
                label: service.label,
                name: instance.name,
                plan: instance.service_plan.name,
                tags: service.tags,
                credentials: key.credentials
            };
        };

        return service;
    });


}());
