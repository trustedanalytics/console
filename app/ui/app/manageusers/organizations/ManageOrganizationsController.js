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
    App.controller('ManageOrganizationsController', function ($scope, OrganizationResource, $stateParams, State,
        editableOptions, editableThemes, targetProvider, $state, OrganizationsModalsService, UserProvider, OrganizationHelper) {

        OrganizationHelper.configEditable(editableOptions, editableThemes);
        $scope.organizations = [];
        $scope.isAdmin = false;
        $scope.state = new State();

        var shownOrgUuid = $stateParams.orgId || null;

        /*jshint latedef: false */
        OrganizationHelper.loadOrganizations($scope.state, refreshOrganizations);

        $scope.showOrg = function (orgGuid) {
            if (orgGuid) {
                shownOrgUuid = orgGuid;
                $scope.current = _.findWhere($scope.organizations, {guid: orgGuid});
            }
            if (!orgGuid || !$scope.current) {
                $scope.current = _.first($scope.organizations);
            }
        };

        UserProvider.isAdmin().then(function (isAdmin) {
            $scope.isAdmin = isAdmin;
        });

        $scope.redirectTo = function (whereTo) {
            targetProvider.setOrganization($scope.current);
            $state.go(whereTo);
        };

        $scope.updateName = function (newName) {
            OrganizationHelper.updateName($scope.state, $scope.current, newName);
        };

        $scope.deleteOrganization = function () {
            OrganizationsModalsService
                .deleteOrganization()
                .then(function () {
                    $scope.state.setPending();
                    return OrganizationResource
                        .supressGenericError()
                        .deleteOrg($scope.current.guid);

                })
                .then(function() {
                    return targetProvider.refresh();
                })
                .then(OrganizationsModalsService.onDeleteSuccess)
                .catch(OrganizationsModalsService.onDeleteError)
                .finally(function () {
                    $scope.state.setLoaded();
                });
        };

        $scope.addSpace = function () {
            OrganizationHelper.addSpace($scope.state, $scope.current, $scope.spaceName, refreshOrganizations);
            $scope.spaceName = '';
        };

        $scope.deleteSpace = function (space) {
            OrganizationHelper.deleteSpace(space, $scope.state, refreshOrganizations);
        };

        $scope.$watchCollection('organizations', function () {
            if (!_.isEmpty($scope.organizations)) {
                $scope.showOrg(shownOrgUuid);
            }
        });

        function refreshOrganizations(organizations) {
            var visibleOrganizations = $scope.isAdmin ? organizations : OrganizationHelper.filterManagedOrganizations(organizations);
            $scope.organizations = visibleOrganizations.sort(function (org1, org2) {
                return org1.name.localeCompare(org2.name);
            });
            if ($scope.current) {
                $scope.showOrg($scope.current.guid);
            }
            else {
                $scope.showOrg();
            }
        }

        $scope.setCurrentOrg = function () {
            $scope.current = targetProvider.getOrganization();
        };
    });
}());
