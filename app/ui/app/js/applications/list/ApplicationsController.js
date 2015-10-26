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
        'ngTableParams', 'filterFilter', 'orderByFilter', '$q', 'AtkInstanceResource', 'ApplicationsTableParams',
        function (ApplicationResource, targetProvider, $scope, ngTableParams, filterFilter,
                  orderByFilter, $q, AtkInstanceResource, ApplicationsTableParams) {
            var self = this;

            var states = {
                PENDING: 1,
                LOADED: 2,
                ERROR: 3
            };
            self.states = states;

            self.details = [];

            function getAtkInstances() {
                return AtkInstanceResource
                    .withErrorMessage('Failed to load ATk instances')
                    .getAll(targetProvider.getOrganization().guid)
                    .then(function onSuccess(response) {
                        return response.instances;
                    });
            }

            function getApplications() {
                return ApplicationResource
                    .withErrorMessage('Failed to load applications list')
                    .getAll(targetProvider.getSpace().guid)
                    .then(function(applications){
                        return applications;
                    });
            }

            var updateApplications = function() {
                if(!_.isEmpty(targetProvider.getSpace())) {
                    self.state = states.PENDING;
                    $q.all([
                        getApplications(),
                        getAtkInstances()
                    ]).then(function(results){
                        self.applications = updateAppNames(results[0], results[1]);
                        self.state = states.LOADED;
                        $scope.tableParams.reload();
                    }).catch(function(){
                        self.state = states.ERROR;
                    });

                }
            };
            updateApplications();

            $scope.tableParams = ApplicationsTableParams.getTableParams($scope, function() {
                return self.applications;
            });

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
        }]);

    function updateAppNames(apps, atkInstances) {
        for (var app in apps) {
            if (apps.hasOwnProperty(app)) {
                for (var atk in atkInstances) {
                    if (atkInstances.hasOwnProperty(atk) && apps[app] && apps[app].urls) {
                        if (apps[app].urls[0] === atkInstances[atk].url) {
                            apps[app].name = atkInstances[atk].name;
                            break;
                        }
                        if (atkInstances[atk].scoring_engine &&
                            apps[app].urls[0] === atkInstances[atk].scoring_engine.url) {
                            apps[app].name = atkInstances[atk].scoring_engine.name;
                        }
                    }
                }
            }
        }
        return apps;
    }
}());
