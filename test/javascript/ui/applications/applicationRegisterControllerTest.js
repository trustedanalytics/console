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
/*jshint -W030 */
describe("Unit: ApplicationRegisterController", function () {
    var scope,
        ctrl,
        state,
        mockApplicationRegisterHelpers,
        _targetProvider,
        $q,
        space = { guid: 's1', name: 'space1'},
        org = { guid: 'o1', name: 'org1' };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, TestHelpers, $rootScope, ApplicationRegisterResource, State, _$q_) {
        scope = $rootScope.$new();
        $q = _$q_;
        mockApplicationRegisterHelpers = {
            registerApp: sinon.stub().returns($q.defer().promise),
            getOfferingsOfApp: sinon.stub().returns($q.defer().promise)
        };

        _targetProvider = (new TestHelpers()).stubTargetProvider({});
        _targetProvider.space = space;
        _targetProvider.org = org;
        state = new State();
        scope.$parent = $rootScope.$new();
        scope.$parent.appId = 'app-guid-1234';
        ctrl = $controller('ApplicationRegisterController',{
            targetProvider: _targetProvider,
            $scope: scope,
            ApplicationRegisterHelpers: mockApplicationRegisterHelpers
        });
    }));

    it('Register application with success', function(){
        var service = {
            app: {
                metadata: {
                    guid: ""
                }
            },
            description: "",
            name: "",
            tags: [],
            metadata: {}
        };
        scope.offerings = [{id: "mock1"}];
        mockApplicationRegisterHelpers.registerApp = sinon.stub().returns(successfulPromise(service));

        scope.submitRegister();
        scope.$digest();

        expect(mockApplicationRegisterHelpers.registerApp).to.be.called;
        expect(scope.state.value, 'state').to.be.equal(state.values.LOADED);
        expect(scope.offerings.length).to.be.equal(2);
        expect(scope.offerings[1]).to.be.equal(service);
    });

    it('Register application with fail', function(){
        mockApplicationRegisterHelpers.registerApp = sinon.stub().returns(rejectedPromise({ status: 500 }));
        scope.offerings = [{id: "mock1"}];

        scope.submitRegister();
        scope.$digest();

        expect(mockApplicationRegisterHelpers.registerApp).to.be.called;
        expect(scope.state.value, 'state').to.be.equal(state.values.LOADED);
        expect(scope.offerings.length).to.be.equal(1);
    });

    function successfulPromise() {
        var deferred = $q.defer();
        deferred.resolve.apply(deferred, arguments);
        return deferred.promise;
    }

    function rejectedPromise() {
        var deferred = $q.defer();
        deferred.reject.apply(deferred, arguments);
        return deferred.promise;
    }
});