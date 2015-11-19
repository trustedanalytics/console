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

    App.controller('TargetSelectorController', function (targetProvider, $scope, UserProvider) {
        var self = this;

        //variable can contain two values: 'managed-only' or '', !!converts them be boolean values
        var requiresManagerRole = !!$scope.managedOnly;

        self.organization = {
            selected: targetProvider.getOrganization(),
            available: targetProvider.getOrganizations(),
            set: function (org) {
                $scope.selectedOrg = org;
                targetProvider.setOrganization(org);
            }
        };

        self.targetSpace = {
            selected: targetProvider.getSpace(),
            available: targetProvider.getSpaces(),
            set: function (space) {
                targetProvider.setSpace(space);
            }
        };

        $scope.organizations = targetProvider.getOrganizations();

        var sortOrgAndSpacesByName = function (items) {
            return _.sortBy(items, 'name');
        };

        $scope.$watch('selectedOrg', function () {
            self.targetSpace.available = sortOrgAndSpacesByName(self.organization.selected.spaces);
        });

        $scope.$watchCollection('organizations', function () {
            //this handler should run only when organization list is loaded - should not act while returned list is still empty
            if (!_.isEmpty($scope.organizations)) {
                UserProvider.getUser(function (user) {
                    self.organization.available = sortOrgAndSpacesByName($scope.organizations);
                    if (user.role !== 'ADMIN' && requiresManagerRole) {
                        self.organization.available = _.where($scope.organizations, {manager: true});
                    }

                    if (!_.findWhere(self.organization.available, {guid: self.organization.selected.guid})) {
                        self.organization.selected = self.organization.available[0];
                        targetProvider.setOrganization(self.organization.selected);
                    }
                });
            }
        });
    });

    App.directive('dTargetSelector', function () {
        return {
            scope: {
                hideSpace: '=',
                managedOnly: '@'
            },
            controller: 'TargetSelectorController as targetCtrl',
            templateUrl: 'app/common/target-provider/target-selector.html'
        };
    });
}());
