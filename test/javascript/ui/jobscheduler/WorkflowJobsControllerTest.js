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

describe("Unit: WorkflowJobsController", function() {

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    var controller, scope, workflowJobResource, targetProvider, defer, $q;

    beforeEach(inject(function($controller, $rootScope, _$state_, _$q_){
        scope = $rootScope.$new();
        $q = _$q_;

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o2' })
        };

        createController = function () {
            controller = $controller('WorkflowJobsController', {
                $scope: scope,
                targetProvider: targetProvider,
                WorkflowJobResource: workflowJobResource
            });
        };

        defer = $q.defer();

        workflowJobResource = {
            getJobs: sinon.stub().returns(defer.promise)
        };
    }));

    it('should not be null', function () {
        controller = createController();

        expect(controller).not.to.be.null;
    });

    it('init, set pending and get jobs', function () {
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(workflowJobResource.getJobs).to.be.called;
    });

    it('targetChanged, get jobs', function () {
        createController();

        scope.$emit('targetChanged');

        expect(workflowJobResource.getJobs).to.be.calledTwice;
    });

    it('init, set pending and check response for getting jobs', function () {
        createController();
        defer.resolve("response");
        scope.$digest();

        expect(scope.state.isLoaded(), 'loaded').to.be.true;
        expect(workflowJobResource.getJobs).to.be.called;
        expect(scope.workflows).to.be.equal("response");
    });

    it('init, set pending and get jobs after loading page', function () {
        createController();
        var deferred = $q.defer();
        workflowJobResource.getJobs = function() {
            return deferred.promise;
        };
        deferred.resolve();

        scope.getJobs;
        scope.$digest();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(scope.unit).to.be.equal("days");
        expect(scope.amount).to.be.equal(1);
    });

});