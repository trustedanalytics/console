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
    App.controller('ManageOrganizationsController', function ($scope, OrganizationResource, $stateParams, State,
        editableOptions, editableThemes, targetProvider, $state, OrganizationsModalsService, SpaceResource,
        NotificationService) {

        editableOptions.theme = 'bs3';

        editableThemes.bs3.inputClass = 'input-lg';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableThemes.bs3.submitTpl = '<button type="submit" class="btn btn-success"><span class="fa fa-check"></span></button>';
        editableThemes.bs3.cancelTpl = '<button type="button" class="btn btn-default" ng-click="$form.$cancel()">' +
            '<span class="fa fa-times text-muted"></span>' +
            '</button>';
        $scope.organizations = [];
        $scope.state = new State();

        var shownOrgUuid = $stateParams.orgId || null;

        /*jshint latedef: false */
        loadOrganizations();

        $scope.showOrg = function (orgGuid) {
            if (orgGuid) {
                shownOrgUuid = orgGuid;
                $scope.current = _.findWhere($scope.organizations, {guid: orgGuid});
            }
            if (!orgGuid || !$scope.current) {
                $scope.current = _.first($scope.organizations);
            }
        };

        $scope.redirectTo = function (whereTo) {
            targetProvider.setOrganization($scope.current);
            $state.go(whereTo);
        };

        $scope.updateName = function (newName) {
            $scope.state.setPending();
            OrganizationResource
                .withErrorMessage('Failed to change organization name')
                .updateName($scope.current.guid, newName)
                .then(OrganizationsModalsService.onUpdateSuccess)
                .catch(OrganizationsModalsService.onUpdateError)
                .finally(function () {
                    $scope.state.setLoaded();
                });
        };

        $scope.deleteOrganization = function () {
            OrganizationsModalsService
                .deleteOrganization()
                .then(function () {
                    $scope.state.setPending();
                    return OrganizationResource
                        .supressGenericError()
                        .deleteOrg($scope.current.guid);

                })
                .then(OrganizationsModalsService.onDeleteSuccess)
                .then(loadOrganizations)
                .catch(OrganizationsModalsService.onDeleteError)
                .finally(function () {
                    $scope.state.setLoaded();
                });
        };

        $scope.addSpace = function () {
            var existingSpace = _.findWhere($scope.current.spaces, {name: $scope.spaceName});
            if (existingSpace) {
                NotificationService.error('Space "' + $scope.spaceName + '" already exists');
            }
            else {
                $scope.state.setPending();
                SpaceResource
                    .withErrorMessage("Failed to create a space")
                    .createSpace($scope.spaceName, $scope.current.guid)
                    .then(function () {
                        return targetProvider.refresh();
                    })
                    .then(function (organizations) {
                        refreshOrganizations(organizations);
                        $scope.spaceName = '';
                        NotificationService.success("Space created");
                    })
                    .finally(function () {
                        $scope.state.setLoaded();
                    });
            }
        };

        $scope.deleteSpace = function (space) {
            NotificationService.confirm('delete-space-confirm')
                .then(function () {
                    $scope.state.setPending();
                    return SpaceResource
                        .withErrorMessage('Failed to remove the space')
                        .removeSpace(space.guid);
                })
                .then(function () {
                    return targetProvider.refresh();
                })
                .then(function (organizations) {
                    refreshOrganizations(organizations);
                    NotificationService.success("Space removed");
                })
                .finally(function () {
                    $scope.state.setLoaded();
                });
        };

        $scope.$watchCollection('organizations', function () {
            if (!_.isEmpty($scope.organizations)) {
                $scope.showOrg(shownOrgUuid);
            }
        });

        function refreshOrganizations(organizations) {
            $scope.organizations = organizations.sort(function (org1, org2) {
                return org1.name.localeCompare(org2.name);
            });
            if ($scope.current) {
                $scope.showOrg($scope.current.guid);
            }
            else {
                $scope.showOrg();
            }
        }

        function loadOrganizations() {
            $scope.state.setPending();

            targetProvider.refresh()
                .then(function (organizations) {
                    refreshOrganizations(organizations);
                    $scope.state.setLoaded();
                })
                .catch(function () {
                    NotificationService.error("Loading organizations failed");
                });
        }

        $scope.setCurrentOrg = function () {
            $scope.current = targetProvider.getOrganization();
        };
    });
}());
