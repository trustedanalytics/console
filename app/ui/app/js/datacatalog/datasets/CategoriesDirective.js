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

    App.directive('dCategories', function (categoriesIcons) {
        return {
            scope: {
                onCategoryChange: '&onCategoryChange',
                categories: '='
            },

            controller: function ($scope) {

                if (!$scope.categories) {
                    $scope.categories = [];
                }

                $scope.getIcon = function (category) {
                    return categoriesIcons[category] || categoriesIcons.other;
                };

                $scope.changeCategory = function (category) {
                    $scope.category = category;
                    $scope.onCategoryChange({category: category});
                };

            },
            templateUrl: 'app/views/datacatalog/datasets/categories.html'
        };
    });
}());
