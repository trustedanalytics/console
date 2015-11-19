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

    App.factory('AtkScoringEngineResource', function (Restangular) {
        var resource = Restangular.service('atk').one('scoring-engine');

        resource.createInstance = function(name, atkName, servicePlanId, orgId, spaceId) {
            return this.post(null, {
                instance_name: name,
                atk_name: atkName,
                service_plan_guid: servicePlanId,
                organization_guid: orgId,
                space_guid: spaceId
            });
        };

        return resource;
    });


}());
