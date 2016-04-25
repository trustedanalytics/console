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

describe("Unit: CoordinatorJobController", function() {

    beforeEach(module("app"));

    var controller, scope, targetProvider, coordinatorJobResource, notificationService, $q;
    var JOB_ID = "job-id", defer;

    beforeEach(inject(function($controller, $rootScope, $stateParams, _$q_){
        scope = $rootScope.$new();
        $q = _$q_;

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o2' })
        };

        notificationService = {
            confirm: function() {
                return $q.defer().promise;
            },
            success: function(){}
        };

        createController = function () {
            controller = $controller('CoordinatorJobController', {
                $scope: scope,
                $stateParams: {coordinatorjobId: JOB_ID},
                targetProvider: targetProvider,
                NotificationService: notificationService,
                CoordinatorJobResource: coordinatorJobResource
            });
        };

        defer = $q.defer();

        coordinatorJobResource = {
            getJob: sinon.stub().returns(defer.promise),
            getJobsForCoord: sinon.stub().returns(defer.promise),
            changeJobStatus: sinon.stub().returns(defer.promise)
        };
    }));

    it('should not be null', function () {
        controller = createController();
        expect(controller).not.to.be.null;
    });

     it('init, set pending and get job details', function () {
         createController();
         expect(scope.state.isPending(), 'pending').to.be.true;
         expect(coordinatorJobResource.getJob).to.be.called;
     });

    it('init, set loaded and check response for getting jobs', function () {
        createController();
        defer.resolve("response");
        scope.$apply();
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
        expect(coordinatorJobResource.getJob).to.be.called;
        expect(scope.job).to.be.equal("response");
    });

    it('init, set loaded and check response for getting jobs for coordinator', function () {
        createController();
        defer.resolve("response");
        scope.$apply();
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
        expect(coordinatorJobResource.getJobsForCoord).to.be.called;
        expect(scope.startedJobs).to.be.equal("response");
    });

    it('init, set loaded and check job status changing', function () {
        createController();
        var deferred = $q.defer();
        var changedSpied = sinon.spy(notificationService, 'success');
        coordinatorJobResource.changeJobStatus = function() {
            return deferred.promise;
        };
        deferred.resolve();
        scope.onStatusChange();
        scope.$digest();
        expect(changedSpied.called).to.be.true;
    });

});