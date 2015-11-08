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

    App.controller('ApplicationController', function ($stateParams, State, ServiceInstanceResource, ApplicationResource,
        $state, NotificationService) {

        var self = this,
            appId = $stateParams.appId;

        self.appId = appId;
        self.state = new State().setPending();

        self.tabs = {
            overview: 1,
            bindings: 2
        };
        self.tab = self.tabs.overview;

        self.servicesToDelete = {};

        self.isTabActive = function (sref) {
            return $state.is(sref);
        };

        /*jshint latedef: false */
        loadApplicationSummary();

        self.refresh = function () {
            self.state.setPending();
            loadApplicationSummary();
        };

        self.restage = function () {
            self.state.setPending();

            ApplicationResource
                .withErrorMessage('Restage failed')
                .postStatus(appId, {
                    state: 'RESTAGING'
                })
                .then(function () {
                    NotificationService.success('Restage has been scheduled');
                })
                .finally(function () {
                    self.state.setLoaded();
                });
        };

        self.start = function () {
            self.state.setPending();

            ApplicationResource.postStatus(appId, {
                    state: 'STARTED'
                })
                .then(function onSuccess() {
                    NotificationService.success('Starting application has been scheduled.');
                })
                .catch(function onError() {
                    NotificationService.error('Starting application failed');
                })
                .finally(function () {
                    self.state.setLoaded();
                });
        };

        self.stop = function () {
            self.state.setPending();

            ApplicationResource.postStatus(appId, {
                    state: 'STOPPED'
                })
                .then(function onSuccess() {
                    NotificationService.success('Stopping the application has been scheduled.');
                })
                .catch(function onError() {
                    NotificationService.error('Stopping the application failed.');
                })
                .finally(function () {
                    self.state.setLoaded();
                });
        };

        self.delete = function () {
            self.state.setPending();

            ApplicationResource
                .withErrorMessage('Deleting application failed')
                .getOrphanServices(appId)
                .then(function onSuccess(servicesToDelete) {
                    self.state.setLoaded();
                    NotificationService.confirm('confirm-delete', {servicesToDelete: servicesToDelete})
                        .then(function (cascade) {
                            self.state.setPending();
                            return ApplicationResource
                                .withErrorMessage('Deleting application failed')
                                .deleteApplication(appId, cascade[0]);
                        })
                        .then(function onSuccess() {
                            $state.go('app.applications');
                        })
                        .finally(function onError() {
                            self.state.setLoaded();
                        });
                })
                .catch(function onError() {
                    self.state.setError();
                });
        };

        function loadInstances() {
            ServiceInstanceResource.getAll(self.application.space_guid)
                .then(function (instances) {
                    self.instances = instances;
                    self.state.setLoaded();
                })
                .catch(function () {
                    self.state.setError();
                });
        }

        function loadApplicationSummary() {
            return ApplicationResource.getApplication(self.appId)
                .then(function onSuccess(application) {
                    application.env = application.environment_json ?
                        Object.keys(application.environment_json).map(function (k) {
                            return {key: k, value: application.environment_json[k]};
                        }) : [];
                    self.application = application;
                })
                .then(function onSuccess() {
                    loadInstances(self, ServiceInstanceResource);
                })
                .catch(function onError(response) {
                    self.state.setError(response.status);
                });
        }

    });


}());
