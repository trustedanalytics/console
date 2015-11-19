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

    App.controller('ServicesController', function ($http, serviceExtractor, targetUrlBuilder, $scope, State,
        targetProvider, ServiceResource) {

        var self = this,
            searchHandler = null,
            state = new State();

        self.state = state;

        self.isSpaceSet = function () {
            return !_.isEmpty(targetProvider.getSpace());
        };

        self.updateServices = function () {

            self.state.setPending();

            if (self.isSpaceSet()) {
                ServiceResource
                    .withErrorMessage('Failed to retrieve services list')
                    .getListBySpace(targetProvider.getSpace().guid)
                    .then(function (data) {
                        data = data || {};
                        self.services = serviceExtractor.extract(data);
                        self.state.setLoaded();
                        self.space = targetProvider.getSpace();
                    })
                    .catch(function () {
                        self.state.setError();
                    });
            }
            else {
                self.space = null;
                self.services = [];
                self.state.setLoaded();
            }
        };

        self.updateServices();

        $scope.$on('targetChanged', function () {
            self.updateServices();
        });

        searchHandler = $scope.$on('searchChanged', function (eventName, searchText) {
            $scope.searchText = searchText;
        });

        $scope.$on('$destroy', function () {
            if (searchHandler) {
                searchHandler();
            }
        });

        self.filterService = function (service) {
            return isServiceMatching(service, $scope.searchText);
        };

    });

    function contains(str, searchText) {
        return str.toLowerCase().indexOf(searchText) > -1;
    }

    function isServiceMatching(service, searchText) {
        if (!searchText) {
            return true;
        }
        searchText = searchText.toLowerCase();
        return contains(service.name, searchText) ||
            contains(service.description, searchText) ||
            service.tags.filter(function (tag) {
                return contains(tag, searchText);
            }).length > 0;
    }
}());
