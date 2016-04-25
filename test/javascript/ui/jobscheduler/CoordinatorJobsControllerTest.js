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

describe("Unit: CoordinatorJobsController", function() {

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    var controller, scope, coordinatorJobResource, targetProvider, defer, $q;

    beforeEach(inject(function($controller, $rootScope, _$state_, _$q_){
        scope = $rootScope.$new();
        $q = _$q_;

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o1' })
        };

        createController = function () {
            controller = $controller('CoordinatorJobsController', {
                $scope: scope,
                targetProvider: targetProvider,
                CoordinatorJobResource: coordinatorJobResource
            });
        };

        defer = $q.defer();

        coordinatorJobResource = {
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
        expect(coordinatorJobResource.getJobs).to.be.called;
    });

    it('targetChanged, get jobs', function () {
        createController();
        scope.$emit('targetChanged');
        expect(coordinatorJobResource.getJobs).to.be.calledTwice;
    });

    it('init, set pending and check response for getting jobs', function () {
        createController();
        defer.resolve("response");
        scope.$digest();
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
        expect(coordinatorJobResource.getJobs).to.be.called;
        expect(scope.coordinatorjobs).to.be.equal("response");
    });

    it('init, set loaded and check job status changing', function () {
        createController();
        var deferred = $q.defer();
        coordinatorJobResource.getJobs = function() {
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