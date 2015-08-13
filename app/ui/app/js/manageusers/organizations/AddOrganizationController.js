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

    /*jshint newcap: false*/
    App.controller('AddOrganizationsController', ['$scope', 'OrganizationResource', 'State', 'NotificationService',
        '$state', 'targetProvider',
        function ($scope, OrganizationResource, State, NotificationService, $state, targetProvider) {
            $scope.state = new State();
            $scope.state.setPending();
            OrganizationResource.getList().then(function(organizations) {
                $scope.state.setLoaded();
                $scope.organizations = organizations;
            });
            $scope.orgName = '';

            $scope.addOrganization = function() {

                var existingOrg = _.findWhere($scope.organizations, {name: $scope.orgName});
                if(existingOrg) {
                    NotificationService.error('Organization "'+$scope.orgName+'" already exists');
                }
                else {
                    var newOrgUuid;
                    $scope.state.setPending();
                    OrganizationResource
                        .withErrorMessage('Error creating organization')
                        .createOrg($scope.orgName)
                        .then(function(uuid) {
                            newOrgUuid = uuid;
                            return targetProvider.refresh();
                        })
                        .then(function() {
                            NotificationService.success('Organization created');
                            $state.go('app.manage.organizations.manage', { orgId: newOrgUuid });
                        })
                        .catch(function() {
                            $scope.state.setError();
                        });
                }
            };
        }]);
}());
