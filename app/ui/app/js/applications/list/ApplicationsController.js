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

    App.controller('ApplicationsController', ['ApplicationResource', 'targetProvider', '$scope',
        'ngTableParams', 'filterFilter', 'orderByFilter', '$q', 'AtkInstanceResource',
        function (ApplicationResource, targetProvider, $scope, ngTableParams, filterFilter,
                  orderByFilter, $q, AtkInstanceResource) {
            var self = this;

            var states = {
                PENDING: 1,
                LOADED: 2,
                ERROR: 3
            };
            self.states = states;

            self.details = [];

            function getAtkInstances($scope, org, AtkInstanceResource) {
                AtkInstanceResource.getAll(org.guid)
                    .then(function onSuccess(response) {
                        $scope.atkInstances = response.instances;
                        ApplicationResource.getAll(targetProvider.getSpace().guid)
                            .then(function(applications){
                                self.applications = updateAppNames(applications, $scope.atkInstances);
                                self.state = states.LOADED;
                            })
                            .catch(function(){
                                self.state = states.ERROR;
                            });
                    })
                    .catch(function() {
                        self.state = states.ERROR;
                    });
            }

            var updateAppNames = function(apps, atkInstances) {
                for (var app in apps) {
                    for(var atk in atkInstances) {
                        if(apps[app] && apps[app].urls) {
                            if (apps[app].urls[0] === atkInstances[atk].url) {
                                apps[app].name = atkInstances[atk].name;
                                break;
                            } else if (atkInstances[atk].scoring_engine &&
                                apps[app].urls[0] === atkInstances[atk].scoring_engine.url) {
                                apps[app].name = atkInstances[atk].scoring_engine.name;
                            }
                        }

                    }
                }
                return apps;
            };

            var updateApplications = function() {
                if(!_.isEmpty(targetProvider.getSpace())) {
                    self.state = states.PENDING;

                    getAtkInstances($scope, targetProvider.getOrganization(), AtkInstanceResource);
                    ApplicationResource
                        .withErrorMessage('Failed to load applications list')
                        .getAll(targetProvider.getSpace().guid)
                        .then(function(applications){
                            self.applications = applications;
                            self.state = states.LOADED;
                        })
                        .catch(function(){
                            self.state = states.ERROR;
                        });
                }
            };
            updateApplications();

            $scope.$on('targetChanged', function(){
                updateApplications();
            });

            self.appStates = function() {
                var def = $q.defer();
                def.resolve([
                    { id: 'STARTED', title: 'STARTED'},
                    { id: 'STARTING', title: 'STARTING'},
                    { id: 'STOPPED', title: 'STOPPED'}
                ]);
                return def;
            };

            self.prepareData = function(data, params){
                if(params.filter()) {
                    data = filterFilter(data, params.filter());
                }
                if(params.sorting()) {
                    data = orderByFilter(data, params.orderBy());
                }
                params.total(data.length);

                var start = (params.page() - 1) * params.count();
                var end = params.page() * params.count();
                return data.slice(start, end);
            };

            /*jshint newcap: false*/
            self.tableParams = new ngTableParams({
                sorting: {
                    name: 'asc'
                },
                page: 1,
                count: 10
            }, {
                counts: [],
                getData: function($defer, params) {
                    var data = self.prepareData(self.applications || [], params);
                    self.dataPrepared = data;
                    $defer.resolve(data);
                }
            });
        }]);
}());
