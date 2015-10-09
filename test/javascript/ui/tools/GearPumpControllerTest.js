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

describe("Unit: GearPumpController", function () {
    var controller,
        createController,
        _targetProvider,
        serviceInstanceMock,
        serviceResourceMock,
        $rootScope,
        locationMock,
        $q,
        scope,
        notificationService,
        organization = {guid: 123, name: 'org'},
        space = {guid: 456, name: 'space'};

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $location, TestHelpers, _$rootScope_, _$q_,
                                ServiceInstanceResource, ServiceResource) {
        serviceInstanceMock = ServiceInstanceResource;
        serviceResourceMock = ServiceResource;
        locationMock = $location;
        _targetProvider = new TestHelpers().stubTargetProvider();
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        notificationService = {
            confirm: function() {},
            success: function() {},
            error: function() {}
        };

        _targetProvider.organization = organization;
        _targetProvider.space = space;

        createController = function() {
            controller = $controller('GearPumpController', {
                $scope: scope,
                $location: locationMock,
                ServiceResource: serviceResourceMock,
                ServiceInstanceResource: serviceInstanceMock,
                targetProvider: _targetProvider,
                NotificationService: notificationService
            });
        };
    }));

    it('should not be null', function() {
        expect(controller).not.to.be.null;
    });

    it('createInstance, create gearpump instance', function () {

        var spyCreateInstance = sinon.spy(serviceInstanceMock, 'createInstance');

        createController();
        scope.servicePlans = [
            {
                metadata: { guid: "guid"},
                entity: {
                    name: "name",
                    free: true
                }
            }
        ];
        scope.createInstance('instance');

        expect(spyCreateInstance.called, 'createInstance called').to.be.true;
    });

    it('deleteInstance, delete entity success, list refresh', function () {
        var instanceId = 123;
        var instances = {
            instance: {
                dashboard_url: 'http://abcd123example.com',
                name: 'fake instance',
                service: '1000-2000',
                service_plan: 'free'
            }
        };

        var deferredInstance = $q.defer();
        serviceInstanceMock.deleteInstance = sinon.stub().returns(deferredInstance.promise);

        var deferredGetInstanceList = $q.defer();
        serviceInstanceMock.getAllByType = sinon.stub().returns(deferredGetInstanceList.promise);

        var deferredGetPlan = $q.defer();
        serviceResourceMock.getAllServicePlansForLabel = sinon.stub().returns(deferredGetPlan.promise);

        var confirmDeferred = $q.defer();
        notificationService.confirm = sinon.stub().returns(confirmDeferred.promise);

        createController();
        scope.deleteInstance(instanceId);

        deferredGetPlan.resolve();
        deferredInstance.resolve();
        deferredGetInstanceList.resolve(instances);
        confirmDeferred.resolve();

        $rootScope.$digest();

        expect(serviceInstanceMock.deleteInstance.calledWith(instanceId), 'deleteInstance calledWith').to.be.true;
    });



});
