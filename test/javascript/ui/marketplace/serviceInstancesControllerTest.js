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
describe("Unit: ServiceInstancesController", function () {

    var controller,
        createController,
        _targetProvider,
        serviceInstanceMock,
        SERVICE_ID = 'qweqwe',
        $rootScope,
        $q,
        scope,
        notificationService,
        organization = { guid: 111, name: "org" },
        space = { guid: 222, name: "space" };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, TestHelpers, _$rootScope_, _$q_,
                                ServiceInstanceResource) {
        serviceInstanceMock = ServiceInstanceResource;

        _targetProvider = new TestHelpers().stubTargetProvider();
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        notificationService = {
            success: function(){},
            genericError: function(){}
        };

        _targetProvider.organization = organization;
        _targetProvider.space = space;

        createController = function() {
            controller = $controller('ServiceInstancesController', {
                $routeParams: { id: SERVICE_ID },
                $scope: scope,
                targetProvider: _targetProvider,
                NotificationService: notificationService,
                ServiceInstanceResource: serviceInstanceMock
            });
        };
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, no space set, do not get instances', function () {
        _targetProvider.space = null;
        var getAllByTypeSpied = sinon.spy(serviceInstanceMock, 'getAllByType');

        createController();

        expect(getAllByTypeSpied.called).to.be.false;
    });

    it('init, got instances, set instances and state loaded', function () {
        var instances = getServiceInstances();
        var deferred = $q.defer();
        serviceInstanceMock.getAllByType = sinon.stub().returns(deferred.promise);
        createController();

        deferred.resolve(instances);
        $rootScope.$digest();

        expect(controller.instances).to.be.deep.equal(instances);
        expect(controller.instancesState.value).to.be.equal(controller.instancesState.values.LOADED);
    });

    it('init, got instances error, set status error', function () {
        var deferred = $q.defer();
        serviceInstanceMock.getAllByType = sinon.stub().returns(deferred.promise);

        createController();
        deferred.reject();
        $rootScope.$digest();
        expect(controller.instancesState.value).to.be.equal(controller.instancesState.values.ERROR);
    });

    it('on targetChanged, get space summary second time', function () {
        var deferred = $q.defer();
        serviceInstanceMock.getAllByType = sinon.stub().returns(deferred.promise);
        createController();
        deferred.resolve();
        $rootScope.$broadcast('targetChanged');
        $rootScope.$digest();
        expect(serviceInstanceMock.getAllByType.called).to.be.true;
    });

    it('on instanceCreated, get space summary second time', function () {
        var deferred = $q.defer();
        serviceInstanceMock.getAllByType = sinon.stub().returns(deferred.promise);
        createController();
        deferred.resolve();
        scope.$emit('instanceCreated');
        $rootScope.$digest();
        expect(serviceInstanceMock.getAllByType.called).to.be.true;
    });

    it('init, no space set, do not get space summary', function () {
        _targetProvider.space = null;
        var getAllByTypeSpied = sinon.spy(serviceInstanceMock, 'getAllByType');

        createController();

        expect(getAllByTypeSpied.called).to.be.false;
    });

    it('deleteInstance, set status pending and delete entity', function () {
        var instance = { guid: 12345 };

        var deferredAll = $q.defer();
        serviceInstanceMock.getAllByType = sinon.stub().returns(deferredAll.promise);

        var deferred = $q.defer();
        serviceInstanceMock.deleteInstance = sinon.stub().returns(deferred.promise);

        createController();
        controller.deleteInstance(instance);
        deferredAll.resolve();
        deferred.resolve();

        $rootScope.$digest();
        expect(serviceInstanceMock.deleteInstance.calledWith(instance.guid)).to.be.true;

    });

    it('deleteInstance, success, set status loaded and reload instances', function () {
        var instance = { guid: 12345 };

        var deferredAll = $q.defer();
        serviceInstanceMock.getAllByType = sinon.stub().returns(deferredAll.promise);

        var deferred = $q.defer();
        serviceInstanceMock.deleteInstance = sinon.stub().returns(deferred.promise);
        createController();
        deferred.resolve();

        controller.deleteInstance(instance);

        $rootScope.$digest();

        expect(controller.deleteState.value).to.be.equal(controller.deleteState.values.DEFAULT);
        expect(serviceInstanceMock.deleteInstance .called).to.be.true;
    });

    it('deleteInstance, error, set status error and show notification', function () {
        var instance = { guid: 12345 };

        var deferredAll = $q.defer();
        serviceInstanceMock.getAllByType = sinon.stub().returns(deferredAll.promise);

        var deferred = $q.defer();
        serviceInstanceMock.deleteInstance = sinon.stub().returns(deferred.promise);
        deferred.reject({status: 500});

        notificationService.genericError = sinon.stub();
        createController();
        controller.service = {name: 'notAtk'};
        controller.deleteInstance(instance);

        $rootScope.$digest();
        expect(controller.deleteState.value).to.be.equal(controller.deleteState.values.DEFAULT);
        expect(notificationService.genericError.called).to.be.true;
    });

    it('deleteInstance, empty instance to delete, do not delete instance', function () {
        var deleteSpied = sinon.spy(serviceInstanceMock, 'deleteInstance');

        controller.deleteInstance();

        expect(deleteSpied.called).to.be.false;
    });

    function getServiceInstances() {
        return [
            {"guid":"3a4eb3e4-2654-4b47-8430-3f808ad171e0","name":"test1","service_plan":"shared","bounded_apps":0},
            {"guid":"36d4d970-bbcf-456e-ac35-f00b81a33f16","name":"security-codes-db","service_plan":"free","bounded_apps":2},
            {"guid":"68ec22a2-56fe-4aa9-b591-9c694f194721","name":"pancho-kafka","service_plan":"shared","bounded_apps":3}
        ];
    }
});
