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

    App.controller('InvitationSendController', ['$http', 'State', 'NotificationService',
        function ($http, State, NotificationService) {
        var self = this;

        var state = new State();
        self.state = state;
        state.value = state.values.DEFAULT;

        self.sendInvitation = function () {
            var invitation = {
                email: self.email,
                eligibleToCreateOrg: true
            };
            self.spinnerText = 'Sending an invitation';
            state.value = state.values.PENDING;

            $http.post('/rest/invitations', invitation)
                .success(function (response) {
                    self.details = response.details;
                    state.value = state.values.LOADED;
                    NotificationService.success('Invitation sent');
                }).error(function (response, status) {
                    var errorCode = parseInt(status, 10);
                    if (errorCode === 403) {
                        self.details = "You do not have permission to invite new users";
                    } else {
                        self.details = response.error;
                    }
                    state.setError();
                    NotificationService.error(self.details);
                });
        };

            self.reset = function()
            {
                self.email = '';
                state.setDefault();
            };
    }]);
}());
