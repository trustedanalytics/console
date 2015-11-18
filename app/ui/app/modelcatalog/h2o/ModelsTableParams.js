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
    App.factory('ModelsTableParams', function (ngTableParams, filterFilter, orderByFilter) {

        return {
            getTableParams: function ($scope, dataCallback) {
                return new ngTableParams({
                    sorting: {
                        name: 'asc'
                    },
                    page: 1,
                    count: 10
                }, {
                    $scope: $scope,

                    getData: function ($defer, params) {
                        var orderedData = params.sorting() ?
                            filterFilter(dataCallback(), params.filter()) :
                            orderByFilter(dataCallback(), params.orderBy());
                        params.total(orderedData.length);
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
            }
        };
    });

}());