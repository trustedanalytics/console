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

    App.factory('ServicePlanResource', ['Restangular', function (Restangular) {

        var servicePlan = Restangular.service("service_plan");

        servicePlan.getPlan = function(name, brokerLabel) {
            return this.one().get({plan: name, label: brokerLabel});
        };
        return servicePlan;
    }]);


}());
