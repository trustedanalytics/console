/**
 * Copyright (c) 2016 Intel Corporation
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
    'use strict';

    App.factory('ApplicationRegisterHelpers', function(ApplicationRegisterResource, NotificationService) {
        return {
            getOfferingsOfApp: function(appGuid) {
                return ApplicationRegisterResource
                    .withErrorMessage('Failed to retrieve service offerings from catalog')
                    .getClonedApplication(appGuid)
                    .then(function (response) {
                        return response.plain();
                    });
            },

            registerApp: function(request) {
                return ApplicationRegisterResource
                    .withErrorMessage('Failed to register application in marketplace')
                    .registerApplication(request)
                    .then(function (response) {
                        NotificationService.success('Application has been registered in marketplace');
                        return response.plain();
                    });
            }
        };
    });
})();