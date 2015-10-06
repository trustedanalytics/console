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
describe("Unit: ToolsInstanceListController", function () {

    var controller,
        createController,
        _targetProvider,
        toolsInstanceMock,
        serviceInstanceMock,
        serviceResourceMock,
        SERVICE_ID = 'qweqwe',
        $rootScope,
        locationMock,
        $q,
        scope,
        notificationService,
        organization = { guid: 111, name: "org" },
        space = { guid: 222, name: "space" };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $location, TestHelpers, _$rootScope_, _$q_,
                                ToolsInstanceResource, ServiceInstanceResource, ServiceResource) {
        toolsInstanceMock = ToolsInstanceResource;
        serviceInstanceMock = ServiceInstanceResource;
        serviceResourceMock = ServiceResource;
        locationMock = $location;

        _targetProvider = new TestHelpers().stubTargetProvider();
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        notificationService = {
            confirm: function() {},
            success: function(){},
            error: function(){},
            withErrorMessage: function() { return this; }
        };

        var state = {
            current: sinon.stub().returnsThis()
        };

        _targetProvider.organization = organization;
        _targetProvider.space = space;

        createController = function() {
            controller = $controller('ToolsInstancesListController', {
                $routeParams: { id: SERVICE_ID },
                $scope: scope,
                $location: locationMock,
                targetProvider: _targetProvider,
                NotificationService: notificationService,
                ToolsInstanceResource: toolsInstanceMock,
                ServiceInstanceResource: serviceInstanceMock,
                ServiceResource: serviceResourceMock,
                $state: state
            });
        };
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });


    it('createInstance, create instance of service', function () {

        var spyCreateInstance = sinon.spy(serviceInstanceMock, 'createInstance');

        createController();
        scope.createInstance('lala');

        expect(spyCreateInstance.called, 'createInstance called').to.be.true;

    });


    it('deleteInstance, delete entity ok, list refreshed', function () {
        var appId = 123;
        var apps = {
            app01: {
                hostname: "name.org",
                login: "login",
                password: "password"
            },
            plain: sinon.stub().returns(this)
        };

        var servicePlans = [
            {
                metadata: { guid: "guid"},
                entity: {
                    name: "name",
                    free: true
                }
            }
        ];

        var deferredApp = $q.defer();
        serviceInstanceMock.deleteInstance = sinon.stub().returns(deferredApp.promise);

        var deferredAppGetToolsInstances = $q.defer();
        toolsInstanceMock.getToolsInstances = sinon.stub().returns(deferredAppGetToolsInstances.promise);

        var deferredGetPlan = $q.defer();
        serviceResourceMock.getAllServicePlansForLabel = sinon.stub().returns(deferredGetPlan.promise);

        var confirmDeferred = $q.defer();
        notificationService.confirm = sinon.stub().returns(confirmDeferred.promise);


        createController();
        scope.deleteInstance(appId);

        deferredGetPlan.resolve(servicePlans);
        deferredApp.resolve();
        deferredAppGetToolsInstances.resolve(apps);
        confirmDeferred.resolve(arguments);

        $rootScope.$digest();

        expect( serviceInstanceMock.deleteInstance.calledWith(appId), 'deleteInstance calledWith').to.be.true;

    });


    it('deleteInstance, not confirmed, deleteInstance should not be called', function () {
        var appId = 123;
        var servicePlans = [
            {
                metadata: { guid: "guid"},
                entity: {
                    name: "name",
                    free: true
                }
            }
        ]

        var deferredApp = $q.defer();
        toolsInstanceMock.deleteInstance = sinon.stub().returns(deferredApp.promise);

        var deferredAppGetToolsInstances = $q.defer();
        toolsInstanceMock.getToolsInstances = sinon.stub().returns(deferredAppGetToolsInstances.promise);

        var confirmDeferred = $q.defer();
        notificationService.confirm = sinon.stub().returns(confirmDeferred.promise);

        var deferredGetPlan = $q.defer();
        serviceResourceMock.getAllServicePlansForLabel = sinon.stub().returns(deferredGetPlan.promise);

        var apps = {
            app01: {
                hostname: "name.org",
                login: "login",
                password: "password"
            },
            plain: sinon.stub().returns(this)
        };

        createController();
        scope.deleteInstance(appId);

        deferredGetPlan.resolve(servicePlans);
        deferredApp.reject();
        deferredAppGetToolsInstances.resolve(apps);
        confirmDeferred.reject(arguments);

        $rootScope.$digest();

        expect( toolsInstanceMock.deleteInstance.called, 'deleteInstance called').to.be.false;

    });
});
