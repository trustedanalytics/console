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
        mockNotificationService,
        mockApplicationRegisterResource,
        _targetProvider,
        $q,
        space = { guid: 's1', name: 'space1'},
        org = { guid: 'o1', name: 'org1' };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, TestHelpers, $rootScope, ApplicationRegisterResource, State, _$q_) {
        scope = $rootScope.$new();
        $q = _$q_;
        mockNotificationService = sinon.stub({success: function(){}});
        var deferredStatus = $q.defer();
        mockApplicationRegisterResource = {
            withErrorMessage: sinon.stub().returnsThis(),
            getClonedApplication: function() {
                return  deferredStatus.promise;
            }
        };
        deferredStatus.resolve({
            plain: function() {
                return {};
            }
        });

        _targetProvider = (new TestHelpers()).stubTargetProvider({});
        _targetProvider.space = space;
        _targetProvider.org = org;
        state = new State();
        scope.clonedApps = [];
        scope.$parent = $rootScope.$new();
        scope.$parent.application = {name: 'app'};
        ctrl = $controller('ApplicationRegisterController',{
            'targetProvider': _targetProvider,
            '$scope': scope,
            'NotificationService': mockNotificationService,
            'ApplicationRegisterResource': mockApplicationRegisterResource
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
            metadata: {},
            plain: function() {
                return this;
            }
        };
        var deferredStatus = $q.defer();
        mockApplicationRegisterResource.registerApplication = function() {
            return  deferredStatus.promise;
        };
        deferredStatus.resolve(service);

        scope.submitRegister();
        scope.$digest();

        expect(mockNotificationService.success.called).to.be.true;
        expect(scope.state.value, 'state').to.be.equal(state.values.LOADED);
    });

    it('Register application with fail', function(){
        var deferredStatus = $q.defer();
        mockApplicationRegisterResource.registerApplication = function() {
            return  deferredStatus.promise;
        };
        deferredStatus.reject({ status: 500 });

        scope.submitRegister();
        scope.$digest();

        expect(mockNotificationService.success.called).to.be.false;
        expect(scope.state.value, 'state').to.be.equal(state.values.LOADED);
    });
});