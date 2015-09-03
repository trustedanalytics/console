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
    App.service('UsersListService', ['ngTableParams', '$filter', function (ngTableParams, $filter ) {

        var tableData = [];

        return {
            setData: function(data) {
                tableData = data;
            },
            getTableParams: function () {
                return new ngTableParams(
                    {
                        page: 1,
                        count: 20,
                        sorting: {
                            name: 'asc'
                        }
                    },
                    {
                        total: tableData.length,
                        getData: function ($defer, params) {
                            var orderedData = params.sorting() ?
                                $filter('orderBy')(tableData, params.orderBy()) :
                                tableData;
                            params.total(orderedData.length);

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });
            }
        };
    }]);
}());