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
describe("Unit: ApplicationController", function () {

    var controller,
        createController,
        applicationResource,
        serviceInstanceResource,
        notificationService,
        state,
        $q,
        $rootScope,
        $state,
        scope,
        APP_ID = "app-guid",
        SAMPLE_APP = {
            guid: APP_ID
        };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, ApplicationResource,
                                ServiceInstanceResource, $routeParams,
                                State, _$q_, _$rootScope_, _$state_) {
        state = new State();
        serviceInstanceResource = ServiceInstanceResource;
        applicationResource = ApplicationResource;
        notificationService = {};
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $state = _$state_;
        createController = function () {
            controller = $controller('ApplicationController', {
                $stateParams: {appId: APP_ID},
                NotificationService: notificationService,
                $scope: scope
            });
        };

    }));

    it('should not be null', function () {
        createController();
        expect(controller).not.to.be.null;
    });

    it('init, set state pending and request for the application', function () {
        var getApplicationSpied = sinon.spy(applicationResource, 'getApplication');

        createController();

        expect(controller.state.value, 'state').to.be.equal(state.values.PENDING);
        expect(getApplicationSpied.called, 'getApplication called').to.be.true;
        expect(getApplicationSpied.calledWith(APP_ID), 'getApplication calledWith').to.be.true;
    });

    it('getApplication error 404, set state error not found', function () {
        var deferred = $q.defer();
        applicationResource.getApplication = sinon.stub().returns(deferred.promise);
        deferred.reject({ status: 404 });
        createController();

        $rootScope.$digest();

        expect(controller.state.value, 'state').to.be.equal(state.values.NOT_FOUND);
    });

    it('getApplication error unknown, set state error', function () {
        var deferred = $q.defer();
        applicationResource.getApplication = sinon.stub().returns(deferred.promise);
        deferred.reject({ status: 500 });

        createController();
        $rootScope.$digest();

        expect(controller.state.value, 'state').to.be.equal(state.values.ERROR);
    });

    it('getApplication success, set application and download instances', function () {
        var application = { guid: 'a1'};
        createAndInitializeController(application);
        $rootScope.$digest();

        expect(controller.application, 'application').to.be.deep.equal(application);
        expect(controller.state.value, 'state').to.be.equal(state.values.LOADED);
        expect(serviceInstanceResource.getAll.called).to.be.true;
    });

    it('getApplication success and get instances success, download instances', function () {
        var application = { guid: 'a1'};
        var instances = getSampleInstances();
        createAndInitializeController(application, instances);
        expect(controller.instances, 'instances').to.deep.be.equal(instances);
        expect(controller.state.value, 'state').to.be.equal(state.values.LOADED);
    });

    it('getApplication success but get instances error, set state error', function () {
        var deferred = $q.defer();
        var application = { guid: 'a1'};
        applicationResource.getApplication = sinon.stub().returns(deferred.promise);
        deferred.resolve(application);

        var instances = getSampleInstances();
        var deferredInstances = $q.defer();
        serviceInstanceResource.getAll = sinon.stub().returns(deferredInstances.promise);
        deferredInstances.reject();

        createController();

        $rootScope.$digest();

        expect(controller.state.value, 'state').to.be.equal(state.values.ERROR);
    });

    it('restage, set restage status', function(){
        var deferredStatus = $q.defer();
        applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise);
        notificationService.success = sinon.stub();

        var application = { guid: APP_ID };

        createAndInitializeController(application);

        controller.restage();

        deferredStatus.resolve();
        $rootScope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {name: 'RESTAGING'})).to.be.true;
        //expect(notificationService.success.called).to.be.true;
    });

    it('delete, delete application resource', function(){
        var deferredDelete = $q.defer();
        var deferredOrphanServices = $q.defer();
        applicationResource.deleteApplication = sinon.stub().returns(deferredDelete.promise);
        applicationResource.getOrphanServices = sinon.stub().returns(deferredOrphanServices.promise);

        var deferredConfirm = $q.defer();
        notificationService.confirm = sinon.stub().returns(deferredConfirm.promise);
        $state.go = sinon.stub();
        createAndInitializeController();

        controller.delete();
        deferredConfirm.resolve(arguments);
        deferredDelete.resolve();
        deferredOrphanServices.resolve();

        scope.$digest();

        expect(applicationResource.getOrphanServices.calledWith(APP_ID)).to.be.true;
        expect(applicationResource.deleteApplication.calledWith(APP_ID)).to.be.true;
        expect($state.go.called).to.be.true;
    });

    it('start, notifications service called with success', function(){
        var deferredStatus = $q.defer();
            applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise),
            notificationService.success = sinon.stub(),
            application = { guid: APP_ID };

        createAndInitializeController(application);

        controller.start();

        deferredStatus.resolve();
        $rootScope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {name: "STARTED"})).to.be.true;
        expect(notificationService.success.calledOnce).to.be.true;
    });

    it('start, set error status if something crashes', function(){
        var deferredStatus = $q.defer();
            applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise),
            notificationService.error = sinon.stub(),
            application = { guid: APP_ID };

        createAndInitializeController(application);

        controller.start();

        deferredStatus.reject();
        $rootScope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {name: "STARTED"})).to.be.true;
        expect(notificationService.error.calledOnce).to.be.true;
    });

    it('stop, notifications service called with success', function(){
        var deferredStatus = $q.defer();
            applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise),
            notificationService.success = sinon.stub(),
            application = { guid: APP_ID };

        createAndInitializeController(application);

        controller.stop();

        deferredStatus.resolve();
        $rootScope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {name: "STOPPED"})).to.be.true;
        expect(notificationService.success.calledOnce).to.be.true;
    });

    it('stop, set error status if something crashes', function(){
        var deferredStatus = $q.defer();
            applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise),
            notificationService.error = sinon.stub(),
            application = { guid: APP_ID };

        createAndInitializeController(application);

        controller.stop();

        deferredStatus.reject();
        $rootScope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {name: "STOPPED"})).to.be.true;
        expect(notificationService.error.calledOnce).to.be.true;
    });

    function getSampleInstances() {
        return [
            {
                guid: 'i1',
                bound_apps: []
            },
            {
                guid: 'i2',
                bound_apps: [
                    {guid: APP_ID}
                ]
            },
            {
                guid: 'i3',
                bound_apps: [
                    {guid: 'a2'},
                    {guid: APP_ID}
                ]
            }
        ];
    }

    function createAndInitializeController(application, instances) {
        var deferred = $q.defer();
        application = application || { guid: APP_ID };
        applicationResource.getApplication = sinon.stub().returns(deferred.promise);
        deferred.resolve(application);

        instances = instances || [];

        var deferredInstances = $q.defer();
        serviceInstanceResource.getAll = sinon.stub().returns(deferredInstances.promise);
        deferredInstances.resolve(instances);

        createController();
        $rootScope.$digest();
    }

});
