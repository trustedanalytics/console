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
describe("Unit: PlatformTestSuitesController", function () {

    var controller,
        createController,
        platformTestsResource,
        notificationService,
        $rootScope,
        scope,
        $q,
        listTestSuiteState,
        availableTestSuitesState;

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, _$rootScope_, _$q_, State) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $q = _$q_;
        listTestSuiteState = new State();
        availableTestSuitesState = new State();
        notificationService = {
            warning: sinon.stub(),
            success: sinon.stub()
        };

        platformTestsResource = {
            getTestSuites: sinon.stub().returns($q.defer().promise),
            getAvailableTestSuites: sinon.stub().returns($q.defer().promise),
            runTestSuite: sinon.stub().returns($q.defer().promise),
            withErrorMessage: function() {
                return this;
            }
        };

        createController = function () {
            controller = $controller('PlatformTestSuitesController', {
                $scope: scope,
                PlatformTestsResource: platformTestsResource,
                NotificationService: notificationService
            });
        };

    }));

    it('should not be null', function () {
        createController();

        expect(controller).not.to.be.null;
    });

    it('init, set states and request for platform test suites', function () {
        createController();

        expect(scope.listTestSuiteState.value, 'Init listTestSuiteState').to.be.equal(listTestSuiteState.values.PENDING);
        expect(scope.availableTestSuitesState.value, 'Init availableTestSuitesState').to.be.equal(availableTestSuitesState.values.PENDING);
        expect(platformTestsResource.getTestSuites).to.be.called;
        expect(platformTestsResource.getAvailableTestSuites).to.be.called;

    });

    it('get platform test suites error, set listTestSuiteState error', function () {
        var deferred = $q.defer();
        deferred.reject();
        platformTestsResource.getTestSuites = sinon.stub().returns(deferred.promise);
        createController();
        $rootScope.$digest();

        expect(platformTestsResource.getTestSuites).to.be.calledOnce;
        expect(scope.listTestSuiteState.value, 'controller listTestSuiteState').to.be.equal(listTestSuiteState.values.ERROR);
    });

     it('get platform available test suites error, set availableTestSuitesState error', function () {
        var deferred = $q.defer();
        deferred.reject();
        platformTestsResource.getAvailableTestSuites = sinon.stub().returns(deferred.promise);
        createController();
        $rootScope.$digest();

        expect(platformTestsResource.getAvailableTestSuites).to.be.calledOnce;
        expect(scope.availableTestSuitesState.value, 'controller availableTestSuitesState').to.be.equal(availableTestSuitesState.values.ERROR);
    });

    it('add one suite to queue, set queue', function () {
        var suite = {
            id: 'TestID'
        };
        createController();
        scope.addToQueue(suite);

        expect(scope.queue.length).to.be.deep.equal(1);
        expect(scope.queue).to.be.deep.equal([suite]);
    });

    it('add duplicated suite to queue, set queue trigger warning', function () {
        var suite = {
            id: 'TestID'
        };
        createController();
        scope.addToQueue(suite);
        scope.addToQueue(suite);

        expect(scope.queue.length).to.be.deep.equal(1);
        expect(scope.queue).to.be.deep.equal([suite]);
        expect(notificationService.warning.calledWith('Duplicates are not allowed in queue')).to.be.true;
    });

    it('run test suite, remove suite from queue', function () {
        var suite = {
            id: 'TestID'
        };
        createController();
        scope.runTestSuite(suite);

        expect(platformTestsResource.runTestSuite).to.be.called;
    });
});
