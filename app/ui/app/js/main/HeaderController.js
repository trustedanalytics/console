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

    App.controller('HeaderController', ['$scope', '$rootScope', 'AppState', 'UserProvider','targetProvider',
        function($scope, $rootScope, AppState, UserProvider, targetProvider) {
        $scope.appState = AppState;
        $scope.searchControl = {};

        UserProvider.getUser(function(user){
            $scope.user = user;
        });

        $scope.showSearch = function() {
            $scope.searchControl.opened = true;
        };

        $rootScope.search = "";
        // Clean search on state change
        $rootScope.$on('$stateChangeSuccess', function() {
          $rootScope.search = "";
        });

        $scope.onSearch = function(){
            $rootScope.$emit('searchChanged');
        };

        $scope.onLogout = function(){
            targetProvider.clear();
        };
        
        $scope.toggleMenu = function() {
            $scope.appState.menuCollapsed = !$scope.appState.menuCollapsed;
            $rootScope.$broadcast("toggleMenu");
        };
    }]);
})();