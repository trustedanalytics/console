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


    App.factory('OrganizationHelper', function(OrganizationResource, OrganizationsModalsService, NotificationService, SpaceResource, targetProvider) {

        return {
            configEditable: configEditable,
            updateName: updateName,
            addSpace: addSpace,
            loadOrganizations: loadOrganizations,
            deleteSpace: deleteSpace,
            filterManagedOrganizations: filterManagedOrganizations
        };

        function configEditable(editableOptions, editableThemes) {
            editableOptions.theme = 'bs3';

            editableThemes.bs3.inputClass = 'input-lg';
            editableThemes.bs3.buttonsClass = 'btn-sm';
            editableThemes.bs3.submitTpl = '<button type="submit" class="btn btn-success"><span class="fa fa-check"></span></button>';
            editableThemes.bs3.cancelTpl = '<button type="button" class="btn btn-default" ng-click="$form.$cancel()">' +
                '<span class="fa fa-times text-muted"></span>' +
                '</button>';
        }

        function updateName(state, current, newName) {
            state.setPending();
            OrganizationResource
                .withErrorMessage('Failed to change organization name')
                .updateName(current.guid, newName)
                .then(OrganizationsModalsService.onUpdateSuccess)
                .catch(OrganizationsModalsService.onUpdateError)
                .finally(function () {
                    state.setLoaded();
                });
        }

        function addSpace(state, current, spaceName, refreshOrganizations) {
            var existingSpace = _.findWhere(current.spaces, {name: spaceName});
            if (existingSpace) {
                NotificationService.error('Space "' + spaceName + '" already exists');
            }
            else {
                state.setPending();
                SpaceResource
                    .withErrorMessage("Failed to create a space")
                    .createSpace(spaceName, current.guid)
                    .then(function () {
                        return targetProvider.refresh();
                    })
                    .then(function (organizations) {
                        refreshOrganizations(organizations);
                        NotificationService.success("Space created");
                    })
                    .finally(function () {
                        state.setLoaded();
                    });
            }
        }

        function loadOrganizations(state, refreshOrganizations) {
            state.setPending();

            targetProvider.refresh()
                .then(function (organizations) {
                    refreshOrganizations(organizations);
                    state.setLoaded();
                })
                .catch(function () {
                    NotificationService.error("Loading organizations failed");
                });
        }

        function deleteSpace(space, state, refreshOrganizations) {
            NotificationService.confirm('delete-space-confirm')
                .then(function () {
                    state.setPending();
                    return SpaceResource
                        .withErrorMessage('Failed to remove the space')
                        .removeSpace(space.guid);
                })
                .then(function () {
                    return targetProvider.refresh();
                })
                .then(function (organizations) {
                    refreshOrganizations(organizations);
                    NotificationService.success("Space deletion scheduled. Please try to refresh page after a while.");
                })
                .finally(function () {
                    state.setLoaded();
                });
        }

        function filterManagedOrganizations(organizations) {
            return _.filter(organizations, function (org) {
                return org.manager;
            });
        }

    });
}());