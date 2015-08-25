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
describe("Unit: ApplicationBindingsController", function () {

    var controller,
        createController,
        serviceInstanceResource,
        serviceBindingResource,
        applicationResource,
        _state,
        notificationService,
        $rootScope,
        $q,
        SAMPLE_APPLICATION = Object.freeze({ guid: 'a1', space_guid: 's1' }),
        SAMPLE_BINDINGS = [
            {guid:'b1', app_guid:'a1', service_instance_guid: 'i2'},
            {guid:'b2', app_guid:'a1', service_instance_guid: 'i3'},
            {guid:'b3', app_guid:'a1', service_instance_guid: 'i4'}
        ],
        SAMPLE_INSTANCES = [{guid:'i1'},{guid:'i2'},{guid:'i3'}];

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, _$rootScope_, ServiceInstanceResource,
                                ServiceBindingResource, applicationBindingExtractor, State, $stateParams, ApplicationResource, _$q_) {
        serviceInstanceResource = ServiceInstanceResource;
        serviceBindingResource = ServiceBindingResource;
        applicationResource = ApplicationResource;
        _state = new State();
        notificationService = {
            success: function(){},
            error: function(){}
        };
        $rootScope = _$rootScope_;
        $q =_$q_;

        $stateParams.appId = SAMPLE_APPLICATION.guid;

        serviceInstanceResource.getAll = function () {
        };
        applicationResource.createBinding = sinon.stub();
        serviceBindingResource.deleteBinding = function () {
        };
        applicationBindingExtractor.extract = function (v) {
            return v;
        };

        createController = function () {
            controller = $controller('ApplicationBindingsController', {
                $scope: $rootScope.$new(),
                NotificationService: notificationService
            });
        };

    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, set state pending and request for bindings', function () {
        var deferred = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferred.promise);
        createController();

        expect(controller.state.value, 'state').to.be.equal(_state.values.PENDING);
        expect(applicationResource.getAllBindings.calledWith(SAMPLE_APPLICATION.guid)).to.be.true;
    });

    it('get bindings success, set bindings', function () {
        var deferred = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferred.promise);
        deferred.resolve(SAMPLE_BINDINGS);

        createController();
        expect(controller.state.value, 'state').to.be.equal(_state.values.PENDING);
        $rootScope.$digest();
        expect(controller.bindings).to.be.deep.equal(SAMPLE_BINDINGS);

    });

    it('get bindings error, set error', function () {
        var deferred = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferred.promise);
        deferred.reject();

        createController();
        $rootScope.$digest();
        expect(controller.state.value, 'state').to.be.equal(_state.values.ERROR);
    });

    it('setApplication, set application', function () {
        controller.setApplication(SAMPLE_APPLICATION);

        expect(controller.application, 'application').to.be.deep.equal(SAMPLE_APPLICATION);
    });

    it('setInstances, set services', function () {
        controller.setInstances(SAMPLE_INSTANCES);

        expect(controller.services).to.be.deep.equal(SAMPLE_INSTANCES);
    });

    it('setApplication, got application, bindings and services, set status loaded', function () {
        var deferred = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferred.promise);
        deferred.resolve(SAMPLE_BINDINGS);

        createController();
        controller.setApplication(SAMPLE_APPLICATION);
        controller.setInstances(SAMPLE_INSTANCES);

        $rootScope.$digest();

        expect(controller.state.value, 'state').to.be.equal(_state.values.LOADED);
        expect(controller.servicesBound, 'bound services').to.be.deep.equal([ SAMPLE_INSTANCES[1], SAMPLE_INSTANCES[2] ]);
        expect(controller.servicesAvailable, 'available services').to.be.deep.equal([ SAMPLE_INSTANCES[0] ]);
    });

    it('bindService, no application set do not create binding', function () {
        createController();
        controller.bindService({ guid: 's1' });

        expect( applicationResource.createBinding.called).to.be.false;
    });

    it('bindService, create binding and set status pending', function () {
        var service = { guid: 's1' };

        var deferredAll = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        applicationResource.createBinding = sinon.stub().returns(deferred.promise);
        deferred.resolve();

        createController();
        controller.setApplication(SAMPLE_APPLICATION);

        controller.bindService(service);
        $rootScope.$digest();
        expect(controller.state.value, 'state').to.be.equal(_state.values.PENDING);
        expect(applicationResource.createBinding.calledWith(SAMPLE_APPLICATION.guid, service.guid), 'called with args').to.be.true;
    });

    it('bindService success, request bindings', function () {
        var deferredAll = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        applicationResource.createBinding = sinon.stub().returns(deferred.promise);
        deferred.resolve();

        createController();

        controller.setApplication(SAMPLE_APPLICATION);
        controller.bindService({ guid: 's1' });
        $rootScope.$digest();

        expect(applicationResource.getAllBindings.called).to.be.true;
    });

    it('unbindService, no application set do not delete binding', function () {
        var deleteBindingSpied = sinon.spy(serviceBindingResource, 'deleteBinding');

        createController();
        controller.bindings = getSampleBindings();

        controller.unbindService({ guid: 's1' });

        expect(deleteBindingSpied.called).to.be.false;
    });

    it('unbindService, delete binding set status pending', function () {
        controller.bindings = getSampleBindings();
        var deferredAll = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        serviceBindingResource.deleteBinding = sinon.stub().returns(deferred.promise);
        deferred.resolve();

        createController();

        controller.setApplication(SAMPLE_APPLICATION);
        controller.state.value = _state.values.LOADED;

        controller.unbindService({ guid: 's1' });

        expect(controller.state.value, 'state').to.be.equal(_state.values.PENDING);
    });

    it('unbindService success, get bindings', function () {
        var deferredAll = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        serviceBindingResource.deleteBinding = sinon.stub().returns(deferred.promise);
        deferred.resolve();

        createController();

        controller.bindings = getSampleBindings();

        controller.setApplication(SAMPLE_APPLICATION);

        controller.unbindService({ guid: 's1' });
        expect(controller.state.value, 'state').to.be.equal(_state.values.PENDING);
        $rootScope.$digest();
        expect(serviceBindingResource.deleteBinding.called).to.be.true;
    });

    it('unbindService error, set status error', function () {

        var deferredAll = $q.defer();
        applicationResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        serviceBindingResource.deleteBinding = sinon.stub().returns(deferred.promise);
        deferred.reject();
        createController();

        controller.bindings = getSampleBindings();
        controller.setApplication(SAMPLE_APPLICATION);
        var errorSpied = sinon.spy(notificationService, 'error');

        controller.unbindService({ guid: 's1' });

        $rootScope.$digest();

        expect(errorSpied.called, 'called').to.be.true;
    });

    function getSampleBindings() {
        return [
            {
                guid: 'b0',
                service_instance_guid: 's0'
            },
            {
                guid: 'b1',
                service_instance_guid: 's1'
            },
            {
                guid: 'b2',
                service_instance_guid: 's2'
            }
        ];
    }
});
