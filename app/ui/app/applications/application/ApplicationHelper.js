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

(function() {
    'use strict';

    App.factory('ApplicationHelper', function(ServiceInstanceResource, ApplicationResource, NotificationService, $q, $state) {

        return {
            loadInstances: loadInstances,
            restageApplication: restageApplication,
            startApplication: startApplication,
            stopApplication: stopApplication,
            loadApplicationSummary: loadApplicationSummary,
            deleteApp: deleteApp
        };

        function loadInstances(state, spaceGuid) {
            return ServiceInstanceResource.getAll(spaceGuid)
                .then(function(instances) {
                    state.setLoaded();
                    return instances;
                });
        }

        function restageApplication(state, appId) {
            instanceAction(state, appId,'RESTAGING');
        }

        function startApplication(state, appId) {
            instanceAction(state, appId,'STARTED');
        }

        function stopApplication(state, appId) {
            instanceAction(state, appId, 'STOPPED');
        }

        function instanceAction(state, appId, action) {
            state.setPending();

            var msg = {
                'STOPPED' : ['Stopping the application has been scheduled.', 'Stopping the application failed.'],
                'STARTED' : ['Starting application has been scheduled.', 'Starting application failed'],
                'RESTAGING': ['Restage has been scheduled', 'Restaging application failed']
            };

            ApplicationResource.postStatus(appId, {
                state: action
            })
                .then(function onSuccess() {
                    NotificationService.success(msg[action][0]);
                })
                .catch(function onError() {
                    NotificationService.error(msg[action][1]);
                })
                .finally(function () {
                    state.setLoaded();
                });
        }

        function loadApplicationSummary(state, appId) {
            var application, instances;
            return ApplicationResource.getApplication(appId)
                .then(function onSuccess(_application_) {
                    application = _application_;
                    application.env = application.environment_json ?
                        Object.keys(application.environment_json).map(function (k) {
                            return { key: k, value: application.environment_json[k] };
                        }) : [];
                })
                .then(function onSuccess() {
                    return loadInstances(state, application.space_guid);
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

        function deleteApp(state, appId) {
            state.setPending();

            ApplicationResource
                .withErrorMessage('Deleting application failed')
                .getOrphanServices(appId)
                .then(function onSuccess(servicesToDelete) {
                    state.setLoaded();
                    NotificationService.confirm('confirm-delete', {servicesToDelete: servicesToDelete})
                        .then(function (cascade) {
                            state.setPending();
                            return ApplicationResource
                                .withErrorMessage('Deleting application failed')
                                .deleteApplication(appId, cascade[0]);
                        })
                        .then(function onSuccess() {
                            $state.go('app.applications');
                            NotificationService.success('Application has been deleted');
                        })
                        .finally(function onError() {
                            state.setLoaded();
                        });
                })
                .catch(function onError() {
                    state.setError();
                });
        }
    });

}());