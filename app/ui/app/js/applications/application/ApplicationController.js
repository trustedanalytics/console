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
                                                      $state, NotificationService, $q) {

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
        loadApplicationSummary(ApplicationResource, self.appId, ServiceInstanceResource, self.state, $q)
            .then(function(data){
                self.instances = data.instances;
                self.application = data.application;
            });


        self.refresh = function () {
            self.state.setPending();
            loadApplicationSummary(ApplicationResource, self.appId, ServiceInstanceResource, self.state, $q)
                .then(function(data){
                    self.instances = data.instances;
                    self.application = data.application;
                });
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

    });

    function loadInstances(serviceInstanceResource, spaceGuid, state) {
        return serviceInstanceResource.getAll(spaceGuid)
            .then(function(instances) {
                state.setLoaded();
                return instances;
            });
    }

    function loadApplicationSummary(applicationResource, appId, serviceInstanceResource, state, $q) {
        var application, instances;
        return applicationResource.getApplication(appId)
            .then(function onSuccess(_application_) {
                application = _application_;
                application.env = application.environment_json ?
                    Object.keys(application.environment_json).map(function (k) {
                        return { key: k, value: application.environment_json[k] };
                    }) : [];
            })
            .then(function onSuccess() {
                return loadInstances(serviceInstanceResource, application.space_guid, state);
            })
            .then(function(_instances_) {
                instances = _instances_;
            })
            .then(function() {
                return {
                    application: application,
                    instances: instances
                };
            })
            .catch(function onError(response) {
                state.setError(response.status);
                return $q.reject();
            });
    }
}());