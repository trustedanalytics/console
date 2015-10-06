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

    App.controller('DisclaimersController', ['$scope', 'PlatformContextProvider',
        function ($scope, PlatformContextProvider) {
            $scope.tools = {};

            PlatformContextProvider.getPlatformContext()
                .then(function success(platformContext) {
                    var list = platformContext.externalTools.list;
                    $scope.tools = _.object(
                        _.pluck(list, 'name'),
                        _.pluck(list, 'available')
                    );
                });

            $scope.hasDisclaimers = function() {
                return $scope.tools.rstudio;
            };
    }]);
})();
