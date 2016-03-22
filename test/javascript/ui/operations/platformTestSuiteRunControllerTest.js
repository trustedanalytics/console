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
describe("Unit: PlatformTestSuiteRunController", function () {

    var controller,
        createController,
        platformTestsResource,
        $rootScope,
        scope,
        $q,
        state,
        ctrlState;

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, _$rootScope_, _$q_, State) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $q = _$q_;
        ctrlState = new State().values;

        platformTestsResource = {
            runTestSuite: sinon.stub().returns($q.defer().promise),
            withErrorMessage: function() {
                return this;
            }
        };
        state = {
            go: sinon.stub()
        };
        createController = function () {
            controller = $controller('PlatformTestSuiteRunController', {
                $scope: scope,
                $state: state,
                PlatformTestsResource: platformTestsResource
            });
        };

    }));

    it('should not be null', function () {
        createController();

        expect(controller).not.to.be.null;
    });

    it('init, set states and request for platform test suites', function () {
        createController();

        expect(scope.state.value, 'controller state').to.be.equal(ctrlState.LOADED);
    });

    it('run platform test suite success, call platform-test to run tests', function () {
        createController();
        scope.username = 'username';
        scope.password = 'password';
        scope.runTestSuite();
        $rootScope.$digest();

        expect(scope.state.value, 'controller state').to.be.equal(ctrlState.PENDING);
        expect(platformTestsResource.runTestSuite).to.be.called;
        expect(state.go.calledWith('app.platformtests.list'));
    });

    it('run platform test suite error, set state error', function () {
        var deferred = $q.defer();
        deferred.reject();
        platformTestsResource.runTestSuite = sinon.stub().returns(deferred.promise);
        createController();
        scope.username = 'username';
        scope.password = 'password';
        scope.runTestSuite();
        $rootScope.$digest();

        expect(platformTestsResource.runTestSuite).to.be.calledOnce;
        expect(scope.state.value, 'controller state').to.be.equal(ctrlState.ERROR);
    });

});