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

    App.controller('WorkflowJobController', function ($scope, State, WorkflowJobResource, $stateParams,
                                                      NotificationService, targetProvider) {

        var state = new State().setPending();
        $scope.state = state;


        WorkflowJobResource.getJob($stateParams.workflowjobId, targetProvider.getOrganization().guid)
            .then(function (response) {
                $scope.job = response;
                $scope.state = state.setLoaded();
            }).catch(function onError() {
                state.setError();
            });


        WorkflowJobResource.getLogs($stateParams.workflowjobId, targetProvider.getOrganization().guid)
            .then(function (response) {
                $scope.logs = response.logs;
                $scope.state = state.setLoaded();
            }).catch(function onError() {
                state.setError();
            });

        $scope.onStatusChange = function(action){
            WorkflowJobResource.changeJobStatus($stateParams.workflowjobId, action)
                .then(function onSuccess(){
                    NotificationService.success('Changing job status on killed');
                }).catch(function onError(){
                    state.setError();
                });
        };

        $scope.toKilled = function(status){
            if(status === 'KILLED' || status==='FAILED' || status==='DONEWITHERROR'){
                return false;
            }
            else{
                return true;
            }
        };
    });
}());