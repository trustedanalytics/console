/**
 * Copyright (c) 2016 Intel Corporation
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

describe("Unit: ServiceInstanceDetailsControllerTest", function () {
    var controller,
        rootScope,
        scope,
        state,
        toolsState,
        deleteState,
        $q,
        $state,
        serviceInstanceResource,
        toolsInstanceResource,
        notificationService,
        createController,
        serviceInstanceDeferred,
        toolsInstanceDeferred,
        deleteInstanceDeferred,
        $httpBackend,
        redirect = 'app.marketplace.instances';

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $rootScope, _$q_, State, _$state_, _$httpBackend_) {
        rootScope = $rootScope;
        scope = rootScope.$new();
        $q = _$q_;
        $state = _$state_;
        state = new State();
        deleteState = new State();
        toolsState = new State();
        serviceInstanceDeferred = $q.defer();
        toolsInstanceDeferred = $q.defer();
        deleteInstanceDeferred = $q.defer();
        $httpBackend = _$httpBackend_;

        serviceInstanceResource = {
            supressGenericError: sinon.stub().returnsThis(),
            getById: sinon.stub().returns(serviceInstanceDeferred.promise),
            deleteInstance: sinon.stub().returns(deleteInstanceDeferred.promise)
        };

        notificationService = {
            success: function () {},
            confirm: function() {
                return $q.defer().promise;
            },
            genericError: function () {},
            error: function () {}
        };

        toolsInstanceResource = {
            getServiceInstance: sinon.stub().returns(toolsInstanceDeferred.promise)
        };

        createController = function () {
            controller = $controller('ServiceInstanceDetailsController', {
                $scope: scope,
                NotificationService: notificationService,
                ServiceInstanceResource: serviceInstanceResource,
                ToolsInstanceResource: toolsInstanceResource,
                $state: $state
            });
        };

        createController();
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, set state pending', function () {
        expect(scope.state.value).to.be.equals(state.values.PENDING);
        expect(scope.toolsState.value).to.be.equals(toolsState.values.PENDING);
        expect(scope.deleteState.value).to.be.equals(deleteState.values.DEFAULT);
    });

    it('init, getById called', function () {
        expect(serviceInstanceResource.getById).to.be.called;
    });

    it('init, getById success, set state on loaded', function () {
        serviceInstanceDeferred.resolve();
        scope.$digest();
        expect(scope.state.value).to.be.equals(state.values.LOADED);
    });

    it('init, getById  404 error, redirect to instances page', function () {
        var spy = sinon.spy($state, 'go');
        serviceInstanceDeferred.reject({status: 404});
        $httpBackend.expectGET('/rest/orgs').respond(200, []);
        scope.$digest();
        expect(spy.calledWith(redirect)).to.be.true;
    });

    it('init, getById other than 404 error, set state on error', function () {
        var errorSpied = sinon.spy(notificationService, 'error');
        serviceInstanceDeferred.reject({status: 500, data: {message: 'error message'}});
        scope.$digest();
        expect(scope.state.value).to.be.equals(state.values.ERROR);
        expect(errorSpied.called).to.be.true;
    });

    it('init, getServiceInstance called', function () {
        expect(toolsInstanceResource.getServiceInstance).to.be.called;
    });

    it('init, getServiceInstance success, set toolsState on loaded', function () {
        toolsInstanceDeferred.resolve();
        scope.$digest();
        expect(scope.toolsState.value).to.be.equals(toolsState.values.LOADED);
    });

    it('init, getServiceInstance error, set toolsState on error', function () {
        toolsInstanceDeferred.reject();
        scope.$digest();
        expect(scope.toolsState.value).to.be.equals(toolsState.values.ERROR);
    });

    it('deleteInstance, invoke, set deleteState on pending', function () {
        scope.deleteServiceInstance();
        scope.$digest();
        expect(scope.deleteState.value).to.be.equals(deleteState.values.PENDING);
    });

    it('deleteInstance, success, redirect to instances page', function () {
        var successSpied = sinon.spy(notificationService, 'success');
        var spy = sinon.spy($state, 'go');
        deleteInstanceDeferred.resolve();
        scope.deleteServiceInstance();
        $httpBackend.expectGET('/rest/orgs').respond(200, []);
        scope.$digest();
        expect(successSpied.called).to.be.true;
        expect(spy.calledWith(redirect)).to.be.true;
    });

    it('deleteInstance, reject with 504 error, notify about success', function () {
        var successSpied = sinon.spy(notificationService, 'success');
        deleteInstanceDeferred.reject({status: 504});
        scope.deleteServiceInstance();
        scope.$digest();
        expect(successSpied.called).to.be.true;
    });

    it('deleteInstance, reject with other than 504 error, notify about error', function () {
        var genericErrorSpied = sinon.spy(notificationService, 'genericError');
        deleteInstanceDeferred.reject({status: 404});
        scope.deleteServiceInstance();
        scope.$digest();
        expect(genericErrorSpied.called).to.be.true;
    });
});