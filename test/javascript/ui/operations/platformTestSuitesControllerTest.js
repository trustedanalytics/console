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
        $rootScope,
        scope,
        $q,
        state;

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, _$rootScope_, _$q_, State) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $q = _$q_;
        state = new State();

        platformTestsResource = {
            getTestSuites: sinon.stub().returns($q.defer().promise),
            withErrorMessage: function() {
                return this;
            }
        };

        createController = function () {
            controller = $controller('PlatformTestSuitesController', {
                $scope: scope,
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

        expect(scope.state.value, 'controller state').to.be.equal(state.values.PENDING);
        expect(platformTestsResource.getTestSuites).to.be.called;
    });

    it('get platform test suites error, set state error', function () {
        var deferred = $q.defer();
        deferred.reject();
        platformTestsResource.getTestSuites = sinon.stub().returns(deferred.promise);
        createController();
        $rootScope.$digest();

        expect(platformTestsResource.getTestSuites).to.be.calledOnce;
        expect(scope.state.value, 'controller state').to.be.equal(state.values.ERROR);
    });

});