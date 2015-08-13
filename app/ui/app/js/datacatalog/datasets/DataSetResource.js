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

    App.factory('DataSetResource', ['Restangular', 'targetProvider', function (Restangular, targetProvider) {
        var datasets = Restangular.service('datasets');

        var organisation = targetProvider.getOrganization();

        datasets.getById = function(id) {
            return this.one(id).get();
        };

        datasets.getByQuery = function(query) {
            return this.one().get({query: query, orgs: organisation.guid});
        };

        datasets.update = function(id, body) {
            return this.one(id).customPOST(body);
        };

        datasets.deleteById = function(id) {
            return this.one(id).remove();
        };

        return datasets;

    }]);
}());

