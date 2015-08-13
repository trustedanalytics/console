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
    App.service('OrganizationsModalsService', ['NotificationService', function (NotificationService) {

        return {
            onUpdateSuccess: function () {
                NotificationService.success('Organization renamed');
            },

            onUpdateError: function () {
                NotificationService.error('Error renaming organization');
            },

            onDeleteSuccess: function() {
                NotificationService.success('Organization deleted');
            },

            onDeleteError: function(error) {
                var msg = 'Error deleting organization.';
                if(error.status === 400) {
                    msg += ' Please make sure that the organization has no spaces in it.';
                }

                NotificationService.genericError(error.data, msg);
            },

            deleteOrganization: function() {
                return NotificationService.confirm('delete-confirm');
            }
        };
    }]);
}());
