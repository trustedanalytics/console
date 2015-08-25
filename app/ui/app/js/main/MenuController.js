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
    App.controller('MenuController', ['$rootScope', '$scope', '$state', '$window', 'UserProvider',
        'targetProvider', 'MenuItems',
        function ($rootScope, $scope, $state, $window, UserProvider, targetProvider, MenuItems) {

            $scope.menuItems = MenuItems;
            $scope.access = {};
            $scope.access.manager = isManager(targetProvider.getOrganization());
            $scope.selected = null;

            $scope.isActive = function (item) {
                return $state.is(item.sref) || $state.includes(item.sref) || _.some(item.items, $scope.isActive);
            };

            $scope.initSelected = function (item) {
                if(!item.collapse) {
                    $scope.selected = item;
                }
            };

            $scope.hasAccess = function (item) {
                return !item.access || _.some(item.access, function (accessName) {
                    return $scope.access[accessName];
                });
            };

            $rootScope.$on('targetChanged', function () {
                $scope.access.manager = isManager(targetProvider.getOrganization());
            });

            UserProvider.getUser(function (user) {
                $scope.access.admin = isAdmin(user);
            });

            $scope.getHref = function(sref) {
                return $state.href(sref);
            };

            $scope.toggleCollapse = function() {
                for(var i = 0; i < $scope.menuItems.length; i++) {
                    if($scope.menuItems[i] === $scope.selected && !$scope.appState.menuCollapsed) {
                        $scope.menuItems[i].collapse = false;
                    } else {
                        $scope.menuItems[i].collapse = true;
                    }
                }
            };

            $scope.toggleCollapseOnSelection = function(item) {
                for(var i = 0; i < $scope.menuItems.length; i++) {
                    if($scope.menuItems[i] === item) {
                        $scope.menuItems[i].collapse = !$scope.menuItems[i].collapse;
                    } else if($scope.menuItems[i] !== $scope.selected || $scope.appState.menuCollapsed) {
                        $scope.menuItems[i].collapse = true;
                    }
                }
            };

            $rootScope.$on('toggleMenu', function() {
                $scope.toggleCollapse();
            });

            $scope.clickOnMenu = function(item, event) {
                if(!item.hasOwnProperty("items")) {
                    $scope.selected = item;
                }
                $scope.toggleCollapseOnSelection(item);
                event.stopPropagation();
            };

            $scope.clickOnSubmenu = function(item, event) {
                $scope.selected = item;
                $scope.toggleCollapse();
                event.stopPropagation();
            };

            $window.onclick = function() {
                if($scope.appState.menuCollapsed){
                    $scope.toggleCollapse();
                    $scope.$apply();
                }
            };
        }]);

    function isAdmin(user) {
        return (user || {}).role === "ADMIN";
    }

    function isManager(organization) {
        return (organization || {}).manager;
    }
})();
