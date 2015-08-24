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
describe("Unit: IPythonController", function () {

    var controller,
        createController,
        _targetProvider,
        serviceInstanceMock,
        applicationMock,
        planMock,
        SERVICE_ID = 'qweqwe',
        $rootScope,
        $q,
        scope,
        notificationService,
        organization = { guid: 111, name: "org" },
        space = { guid: 222, name: "space" };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, TestHelpers, _$rootScope_, _$q_,
                                ServiceInstanceResource, ApplicationResource, ServicePlanResource) {
        serviceInstanceMock = ServiceInstanceResource;
        applicationMock = ApplicationResource;
        planMock = ServicePlanResource;

        _targetProvider = new TestHelpers().stubTargetProvider();
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        notificationService = {
            confirm: function() {},
            success: function(){},
            error: function(){}
        };

        _targetProvider.organization = organization;
        _targetProvider.space = space;

        createController = function() {
            controller = $controller('IPythonController', {
                $routeParams: { id: SERVICE_ID },
                $scope: scope,
                targetProvider: _targetProvider,
                NotificationService: notificationService,
                ServiceInstanceResource: serviceInstanceMock,
                ApplicationResource: applicationMock,
                ServicePlanResource: planMock
            });
        };
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });


    it('createInstance, create instance of service', function () {

        var spyCreateInstance = sinon.spy(serviceInstanceMock, 'createInstance');

        var deferredGetPlan = $q.defer();
        planMock.getPlan = sinon.stub().returns(deferredGetPlan.promise);

        createController();
        scope.createInstance('lala');

        deferredGetPlan.resolve();

        expect(spyCreateInstance.called, 'createInstance called').to.be.true;

    });


    it('deleteInstance, delete entity ok, list refreshed', function () {
        var appId = 123;

        var deferredGetPlan = $q.defer();
        planMock.getPlan = sinon.stub().returns(deferredGetPlan.promise);

        var deferredApp = $q.defer();
        applicationMock.deleteApplication = sinon.stub().returns(deferredApp.promise);

        var deferredAppGetAll = $q.defer();
        applicationMock.getAllByServiceType = sinon.stub().returns(deferredAppGetAll.promise);

        var confirmDeferred = $q.defer();
        notificationService.confirm = sinon.stub().returns(confirmDeferred.promise);


        createController();
        scope.deleteInstance(appId);

        deferredGetPlan.resolve();
        deferredApp.resolve();
        deferredAppGetAll.resolve();
        confirmDeferred.resolve(arguments);

        $rootScope.$digest();

        expect( applicationMock.deleteApplication.calledWith(appId, arguments[0]), 'deleteApplication calledWith').to.be.true;

    });


    it('deleteInstance, not confirmed, deleteApplication should not be called', function () {
        var appId = 123;

        var deferredGetPlan = $q.defer();
        planMock.getPlan = sinon.stub().returns(deferredGetPlan.promise);

        var deferredApp = $q.defer();
        applicationMock.deleteApplication = sinon.stub().returns(deferredApp.promise);

        var deferredAppGetAll = $q.defer();
        applicationMock.getAllByServiceType = sinon.stub().returns(deferredAppGetAll.promise);

        var confirmDeferred = $q.defer();
        notificationService.confirm = sinon.stub().returns(confirmDeferred.promise);


        createController();
        scope.deleteInstance(appId);

        deferredGetPlan.resolve();
        deferredApp.reject();
        deferredAppGetAll.resolve();
        confirmDeferred.reject(arguments);

        $rootScope.$digest();

        expect( applicationMock.deleteApplication.called, 'deleteApplication called').to.be.false;

    });


});
