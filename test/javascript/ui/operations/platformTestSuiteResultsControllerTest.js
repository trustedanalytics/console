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
describe("Unit: PlatformTestSuiteResultsController", function () {

    var controller,
        createController,
        platformTestsResource,
        $rootScope,
        scope,
        $q,
        state,
        TEST_SUITE_ID = "test-suite-id";

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, _$rootScope_, _$q_, State) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $q = _$q_;
        state = new State();

        platformTestsResource = {
            getResults: function(){
                return $q.defer().promise;
            },
            success: function(){},
            withErrorMessage: function() {
                return this;
            }
        };

        createController = function () {
            controller = $controller('PlatformTestSuiteResultsController', {
                $scope: scope,
                $stateParams: {testSuiteId: TEST_SUITE_ID},
                PlatformTestsResource: platformTestsResource
            });
        };

    }));

    it('should not be null', function () {
        createController();

        expect(controller).not.to.be.null;
    });

    it('init, set states and request for platform test results', function () {
        var getResultsSpied = sinon.spy(platformTestsResource, 'getResults');

        createController();

        expect(scope.state.value, 'controller state').to.be.equal(state.values.PENDING);
        expect(getResultsSpied).to.be.called;
        expect(getResultsSpied.calledWith(TEST_SUITE_ID), 'getResults calledWith').to.be.true;
    });

    it('get platform test results error, set state error', function () {
        var deferred = $q.defer();
        deferred.reject();
        platformTestsResource.getResults = sinon.stub().returns(deferred.promise);
        createController();
        $rootScope.$digest();

        expect(platformTestsResource.getResults).to.be.calledOnce;
        expect(scope.state.value, 'controller state').to.be.equal(state.values.ERROR);
    });

});