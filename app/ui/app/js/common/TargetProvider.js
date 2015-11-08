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

    App.factory('targetProvider', function ($cookies, OrganizationResource, $rootScope, $q, NotificationService) {
        var ORGANIZATION_KEY = "organization";
        var SPACE = "space";

        var
            organization = {},
            space = {},
            organizations = [],
            spaces = [],
            target = {},
            emptyOrganizationsError = 'You are not assigned to any organization. Contact administrators.',
            empty = true;
        angular.copy($cookies.getObject(ORGANIZATION_KEY), organization);
        angular.copy($cookies.getObject(SPACE), space);

        var getData = function () {
            return OrganizationResource
                .withErrorMessage('Failed to retrieve organization list from server')
                .getList()
                .then(function (newOrganizations) {
                    angular.copy(newOrganizations, organizations);

                    if (organizations.length === 0) {
                        NotificationService.error(emptyOrganizationsError);
                        return $q.reject(emptyOrganizationsError);
                    }

                    var oldSpaceGuid = space.guid;

                    var newOrganization = (organization &&
                        _.findWhere(organizations, {guid: organization.guid})) ||
                        organizations[0];
                    var orgChanged = organization.guid !== newOrganization.guid;

                    target.setOrganization(newOrganization, true);

                    var spaceChanged = space.guid !== oldSpaceGuid;

                    if (orgChanged || spaceChanged) {
                        $rootScope.$broadcast('targetChanged');
                    }
                    return organizations;
                });
        };

        var ensureData = function () {
            if (empty) {
                empty = false;
                getData();
            }
        };

        var checkSpace = function (space) {
            return _.some(spaces, function (item) {
                return angular.equals(item, space);
            });
        };

        return angular.extend(target, {
            getOrganization: function () {
                ensureData();
                return organization;
            },
            getSpace: function () {
                ensureData();
                return space;
            },
            setOrganization: function (newOrganization, muteEvent) {
                angular.copy(newOrganization, organization);
                $cookies.putObject(ORGANIZATION_KEY, organization);

                angular.copy(organization.spaces, spaces);
                if (!checkSpace(space)) {
                    target.setSpace(spaces[0], true);
                }
                if (!muteEvent) {
                    $rootScope.$broadcast('targetChanged');
                }
            },
            setSpace: function (newSpace, muteEvent) {
                angular.copy(newSpace, space);
                $cookies.putObject(SPACE, space);
                if (!muteEvent) {
                    $rootScope.$broadcast('targetChanged');
                }
            },

            getOrganizations: function () {
                ensureData();
                return organizations;
            },
            getSpaces: function () {
                ensureData();
                return spaces;
            },

            clear: function () {
                $cookies.remove(ORGANIZATION_KEY);
                $cookies.remove(SPACE);
                return $cookies;
            },
            refresh: function () {
                return getData();
            }
        });
    });

}());
