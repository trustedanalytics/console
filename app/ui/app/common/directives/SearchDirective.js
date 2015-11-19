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

    App.directive('dSearch', function () {
        return {
            scope: {
                control: '='
            },

            controller: function ($scope, $element, $rootScope, $timeout) {
                var input = $element.find('input');

                input.on('blur', function () {
                    $scope.control.opened = false;
                    $timeout(function () {
                        $scope.$apply();
                    });
                });

                $scope.search = function () {
                    $rootScope.$broadcast('searchChanged', $scope.value);
                };

                $rootScope.$on('$stateChangeSuccess', function () {
                    $scope.value = '';
                    $scope.search();
                });

                $scope.$watch('control', function (newValue) {
                    if (newValue.opened) {
                        input.focus();
                    } else {
                        input.blur();
                    }
                }, true);
            },
            templateUrl: 'app/common/search.html'
        };
    });
}());
