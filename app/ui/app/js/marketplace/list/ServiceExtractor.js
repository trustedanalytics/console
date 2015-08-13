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

    App.factory('serviceExtractor', [function () {
        return {
            extract: function (data) {
                var self = this;
                var resources = data.resources || [];
                var services = [];
                for (var i in resources) {
                    if (resources.hasOwnProperty(i)) {
                        var service = self.extractService(resources[i]);
                        if (service) {
                            services.push(service);
                        }
                    }
                }
                return services;
            },
            extractService: function (resource) {
                var entity = resource.entity || {};
                var metadata = resource.metadata || {};
                var extra = JSON.parse(entity.extra) || {};
                var service = {
                    id: metadata.guid,
                    name: extra.displayName || entity.label,
                    image: extra.imageUrl,
                    description: extra.longDescription || entity.description,
                    provider: extra.providerDisplayName,
                    tags: entity.tags,
                    plans: this.extractPlans(entity.service_plans)
                };
                return service.name ? service : null;
            },
            extractPlans: function(plansData) {
                plansData = plansData || [];
                return plansData.map(function(planData){
                    var plan = planData.entity || {};
                    plan.guid = (planData.metadata || {}).guid;
                    var extra = JSON.parse(plan.extra || '{}') || {};
                    plan.costs = extra.costs || [];
                    plan.bullets = extra.bullets || [];
                    return plan;
                });
            }
        };

    }]);


}());
