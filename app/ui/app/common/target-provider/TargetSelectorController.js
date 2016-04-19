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

    App.controller('TargetSelectorController', function (targetProvider, $scope, UserProvider, $state, $rootScope) {
        var user = {};

        $scope.targetHeader = $state.current.targetHeader;

        $scope.organization = {
            selected: targetProvider.getOrganization(), 
            available: targetProvider.getOrganizations(),
            set: function (org) {
                $scope.selectedOrg = org;
                targetProvider.setOrganization(org);
            }
        };

        $scope.targetSpace = {
            selected: targetProvider.getSpace(),
            available: targetProvider.getSpaces(),
            set: function (space) {
                targetProvider.setSpace(space);
            }
        };

        UserProvider.getUser(function (_user) {
            user = _user;
            $scope.organization.available = getAvailableOrgs(user.role, targetProvider.getOrganizations(),
                $scope.targetHeader);
        });

        $rootScope.$on("$stateChangeSuccess", function() {
            $scope.targetHeader = $state.current.targetHeader;
            $scope.organization.available = getAvailableOrgs(user.role, targetProvider.getOrganizations(),
                $scope.targetHeader);
        });

        $scope.$watch('selectedOrg', function () {
            $scope.targetSpace.available = sortOrgAndSpacesByName($scope.organization.selected.spaces);
        });

        $scope.$watchCollection('organizations', function () {

            //this handler should run only when organization list is loaded - should not act while returned list is still empty
            if(_.isEmpty($scope.organizations)) {
                return;
            }

            UserProvider.getUser(function (user) {
                $scope.organization.available = sortOrgAndSpacesByName($scope.organizations);
                if (user.role !== 'ADMIN' && $scope.targetHeader.managedOnly) {
                    $scope.organization.available = _.where($scope.organizations, {manager: true});
                }

                if (!_.findWhere($scope.organization.available, {guid: $scope.organization.selected.guid})) {
                    $scope.organization.selected = $scope.organization.available[0];
                    targetProvider.setOrganization($scope.organization.selected);
                }
            });
        });
    });

    function sortOrgAndSpacesByName(items) {
        return _.sortBy(items, 'name');
    }

    function getAvailableOrgs(role, orgs, targetHeader) {
        orgs = sortOrgAndSpacesByName(orgs);
        if(role !== 'ADMIN' && targetHeader.managedOnly) {
            return getCurrentOrgManagerOrgs(orgs);
        }
        return orgs;
    }

    function getCurrentOrgManagerOrgs(orgs) {
        return _.where(orgs, {manager: true});
    }
}());
