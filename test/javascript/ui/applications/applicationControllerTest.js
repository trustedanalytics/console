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
describe("Unit: ApplicationController", function () {

    var controller,
        createController,
        applicationResource,
        serviceInstanceResource,
        notificationService,
        state,
        $q,
        $state,
        $scope,
        APP_ID = "app-guid";

    beforeEach(module('app'));

    beforeEach(inject(function(targetProvider) {
       targetProvider.refresh = sinon.stub().returns([]);
    }));

    beforeEach(inject(function ($controller, ApplicationResource,
                                ServiceInstanceResource, $routeParams,
                                State, _$q_, $rootScope, _$state_) {
        state = new State();
        serviceInstanceResource = ServiceInstanceResource;
        applicationResource = ApplicationResource;
        notificationService = {};
        $q = _$q_;
        $scope = $rootScope.$new();
        $state = _$state_;
        createController = function () {
            controller = $controller('ApplicationController', {
                $stateParams: {appId: APP_ID},
                NotificationService: notificationService,
                $scope: $scope
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

        expect($scope.state.value, 'state').to.be.equal(state.values.PENDING);
        expect(getApplicationSpied.called, 'getApplication called').to.be.true;
        expect(getApplicationSpied.calledWith(APP_ID), 'getApplication calledWith').to.be.true;
    });

    it('getApplication error 404, set state error not found', function () {
        var deferred = $q.defer();
        applicationResource.getApplication = sinon.stub().returns(deferred.promise)
        deferred.reject({ status: 404 });
        createController();
        $scope.$digest();

        expect($scope.state.value, 'state').to.be.equal(state.values.NOT_FOUND);
    });

    it('getApplication error unknown, set state error', function () {
        var deferred = $q.defer();
        applicationResource.getApplication = sinon.stub().returns(deferred.promise);
        deferred.reject({ status: 500 });

        createController();
        $scope.$digest();

        expect($scope.state.value, 'state').to.be.equal(state.values.ERROR);
    });

    it('getApplication success, set application and download instances', function () {
        var application = { guid: 'a1'};
        createAndInitializeController(application);
        $scope.$digest();

        expect($scope.application, 'application').to.be.deep.equal(application);
        expect($scope.state.value, 'state').to.be.equal(state.values.LOADED);
        expect(serviceInstanceResource.getAll.called).to.be.true;
    });

    it('getApplication success and get instances success, download instances', function () {
        var application = { guid: 'a1'};
        var instances = getSampleInstances();
        createAndInitializeController(application, instances);
        expect($scope.instances, 'instances').to.deep.be.equal(instances);
        expect($scope.state.value, 'state').to.be.equal(state.values.LOADED);
    });

    it('getApplication success but get instances error, set state error', function () {
        var deferred = $q.defer();
        var application = { guid: 'a1'};
        applicationResource.getApplication = sinon.stub().returns(deferred.promise);
        deferred.resolve(application);

        getSampleInstances();
        var deferredInstances = $q.defer();
        serviceInstanceResource.getAll = sinon.stub().returns(deferredInstances.promise);
        deferredInstances.reject({ status: 404 });

        createController();

        $scope.$digest();

        expect($scope.state.isError(), 'state').to.be.true;
    });

    it('restage, set restage status', function(){
        var deferredStatus = $q.defer();
        applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise);
        notificationService.success = sinon.stub();

        var application = { guid: APP_ID };

        createAndInitializeController(application);

        $scope.restage();

        deferredStatus.resolve();
        $scope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {state: 'RESTAGING'})).to.be.true;
    });

    it('delete, delete application resource', function(){
        var deferredDelete = $q.defer();
        var deferredOrphanServices = $q.defer();
        applicationResource.deleteApplication = sinon.stub().returns(deferredDelete.promise);
        applicationResource.getOrphanServices = sinon.stub().returns(deferredOrphanServices.promise);

        var deferredConfirm = $q.defer();
        notificationService.confirm = sinon.stub().returns(deferredConfirm.promise);
        notificationService.success = sinon.stub();
        $state.go = sinon.stub();
        createAndInitializeController();

        $scope.delete();
        deferredConfirm.resolve(arguments);
        deferredDelete.resolve();
        deferredOrphanServices.resolve();

        $scope.$digest();

        expect(applicationResource.getOrphanServices.calledWith(APP_ID)).to.be.true;
        expect(applicationResource.deleteApplication.calledWith(APP_ID)).to.be.true;
        expect($state.go.called).to.be.true;
    });

    it('start, notifications service called with success', function(){
        var deferredStatus = $q.defer();
        applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise);
        notificationService.success = sinon.stub();
        application = { guid: APP_ID };

        createAndInitializeController(application);

        $scope.start();

        deferredStatus.resolve();
        $scope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {state: "STARTED"})).to.be.true;
        expect(notificationService.success.calledOnce).to.be.true;
    });

    it('start, set error status if something crashes', function(){
        var deferredStatus = $q.defer();
        applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise);
        notificationService.error = sinon.stub();
        application = { guid: APP_ID };

        createAndInitializeController(application);

        $scope.start();

        deferredStatus.reject();
        $scope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {state: "STARTED"})).to.be.true;
        expect(notificationService.error.calledOnce).to.be.true;
    });

    it('stop, notifications service called with success', function(){
        var deferredStatus = $q.defer();
        applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise);
        notificationService.success = sinon.stub();
        application = { guid: APP_ID };

        createAndInitializeController(application);

        $scope.stop();

        deferredStatus.resolve();
        $scope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {state: "STOPPED"})).to.be.true;
        expect(notificationService.success.calledOnce).to.be.true;
    });

    it('stop, set error status if something crashes', function(){
        var deferredStatus = $q.defer();
        applicationResource.postStatus = sinon.stub().returns(deferredStatus.promise);
        notificationService.error = sinon.stub();
        application = { guid: APP_ID };

        createAndInitializeController(application);

        $scope.stop();

        deferredStatus.reject();
        $scope.$digest();
        expect(applicationResource.postStatus.calledWith(APP_ID, {state: "STOPPED"})).to.be.true;
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
        $scope.$digest();
    }

});