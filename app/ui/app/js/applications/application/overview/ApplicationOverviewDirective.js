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

    App.directive('dApplicationOverview', function () {
        return {
            scope: {
                application: '=',
                instances: '=',
                onDelete: '&',
                onRestage: '&',
                onStart: '&',
                onStop: '&',
                onRefresh: '&'
            },
            templateUrl: 'app/views/applications/application/overview.html',
            controller: function($scope){
                function reloadInstances(){
                    if(!$scope.application || !$scope.instances) {
                        return;
                    }

                    $scope.appInstances = $scope.instances.filter(function(instance){
                        return _.findWhere(instance.bound_apps, {
                            guid: $scope.application.guid
                        });
                    });
                }

                $scope.$watch('instances', function(){
                    reloadInstances();
                });

                $scope.$watch('application', function(){
                    reloadInstances();
                });

            }
        };
    });

}());
