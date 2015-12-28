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
    App.controller('MenuController', function ($rootScope, $scope, $state, $window, UserProvider, targetProvider,
        MenuItems, PlatformContextProvider) {

        $scope.menuItems = MenuItems;
        $scope.access = {};
        $scope.access.currentOrgManager = isCurrentOrgManager(targetProvider.getOrganization());
        $scope.selected = null;
        $scope.tools = [];
        $scope.organizations = targetProvider.getOrganizations();

        getExternalTools(PlatformContextProvider, $scope);

        var itemValidators = [
            function access(item) {
                return hasAccess(item.access, $scope.access);
            },
            function toolAvailability(item) {
                return isToolAvailable(item.tool, $scope.tools);
            }
        ];

        $scope.isActive = function (item) {
            return $state.is(item.sref) || $state.includes(item.sref) || _.some(item.items, $scope.isActive);
        };

        $scope.initSelected = function (item) {
            if (!item.collapse) {
                $scope.selected = item;
            }
        };

        $scope.isVisible = function (item) {
            return _.every(itemValidators, function (validator) {
                return validator(item);
            });
        };

        $scope.$on('targetChanged', function () {
            $scope.access.currentOrgManager = isCurrentOrgManager(targetProvider.getOrganization());
        });

        $scope.$watchCollection('organizations', function(orgs) {
            $scope.access.anyOrgManager = isAnyOrgManager(orgs);
        });


        UserProvider.getUser(function (user) {
            $scope.access.admin = isAdmin(user);
        });

        $scope.getHref = function (sref) {
            return $state.href(sref);
        };

        $scope.toggleCollapse = function () {
            for (var i = 0; i < $scope.menuItems.length; i++) {
                if ($scope.menuItems[i] === $scope.selected && !$scope.appState.menuCollapsed) {
                    $scope.menuItems[i].collapse = false;
                } else {
                    $scope.menuItems[i].collapse = true;
                }
            }
        };

        $scope.toggleCollapseOnSelection = function (item) {
            for (var i = 0; i < $scope.menuItems.length; i++) {
                if ($scope.menuItems[i] === item) {
                    $scope.menuItems[i].collapse = !$scope.menuItems[i].collapse;
                } else if ($scope.menuItems[i] !== $scope.selected || $scope.appState.menuCollapsed) {
                    $scope.menuItems[i].collapse = true;
                }
            }
        };

        $rootScope.$on('toggleMenu', function () {
            $scope.toggleCollapse();
        });

        $scope.clickOnMenu = function (item, event) {
            if (!item.hasOwnProperty("items")) {
                $scope.selected = item;
            }
            $scope.toggleCollapseOnSelection(item);
            event.stopPropagation();
        };

        $scope.clickOnSubmenu = function (item, event) {
            $scope.selected = item;
            $scope.toggleCollapse();
            event.stopPropagation();
        };

        $window.onclick = function () {
            if ($scope.appState.menuCollapsed) {
                $scope.toggleCollapse();
                $scope.$apply();
            }
        };
    });

    function hasAccess(accessRestrictions, accessGranted) {
        return !accessRestrictions || _.some(accessRestrictions, function (accessName) {
                return accessGranted[accessName];
            });
    }

    function isToolAvailable(toolName, tools) {
        if (!toolName) {
            return true;
        }
        var tool = _.findWhere(tools, {name: toolName});
        return tool && tool.available;
    }

    function isAdmin(user) {
        return (user || {}).role === "ADMIN";
    }

    function isCurrentOrgManager(organization) {
        return (organization || {}).manager;
    }

    function isAnyOrgManager(organizations) {
        return _.some(organizations, function(org) {
            return org.manager;
        });
    }

    function getExternalTools(PlatformContextProvider, $scope) {
        PlatformContextProvider
            .getPlatformContext()
            .then(function (platformContext) {
                var externalTools = platformContext.external_tools;
                $scope.tools = _.union(externalTools.others, externalTools.visualizations);
            });
    }
})();
