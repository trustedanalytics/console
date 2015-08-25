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
describe("Unit: DataToolsController", function () {

    var controller,
        targetProvider,
        rootScope,
        scope,
        atkInstancesResource,
        atkScoringEngineResource,
        atkClientResource,
        serviceInstanceResource,
        notificationService,
        createController,
        $q,
        SAMPLE_ORGANIZATION = { guid: 'o1' },
        SAMPLE_SPACE = { guid: 's1' },
        SAMPLE_ATK_RESPONSE = Object.freeze({
            "instances" : [{
                "name" : "atk1",
                "url" : "atk-1.apps.example.com",
                "state" : "STARTED"
            }, {
                "name" : "atk2",
                "url" : "atk-2.apps.example.com",
                "state" : "STOPPED"
            }, {
                "name" : "test",
                "url" : "atk-test.apps.example.com",
                "state" : "STARTED"
            }
            ],
            "service_plan_guid" : "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE"
        });

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $rootScope, State, TestHelpers, _$q_) {
        targetProvider = new TestHelpers().stubTargetProvider();
        state = new State();
        rootScope = $rootScope;
        scope = rootScope.$new();
        $q = _$q_;
        atkInstancesResource = {
            getAll: function() {}
        };

        atkScoringEngineResource = {

        };

        atkClientResource = {
            getOne: function() {}
        };

        serviceInstanceResource = {
            save: function() {},
            supressGenericError: function() {
                return this;
            }
        };

        notificationService = {
            success: function() {},
            error: function(){}
        };

        createController = function() {
            controller = $controller('DataToolsController', {
                $scope: scope,
                targetProvider: targetProvider,
                AtkInstanceResource: atkInstancesResource,
                AtkScoringEngineResource: atkScoringEngineResource,
                AtkClientResource: atkClientResource,
                ServiceInstanceResource: serviceInstanceResource,
                NotificationService: notificationService
            });
        };
        createController();
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, set state pending', function () {
        expect(scope.state.value).to.be.equals(state.values.PENDING);
        expect(scope.clientState.value).to.be.equals(state.values.PENDING);
    });

    it('init, organization set, get atk instance', function () {
        var orgId = null;
        atkInstancesResource.getAll = function(_orgId) {
            orgId = _orgId;
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        };
        var getAllSpied = sinon.spy(atkInstancesResource, 'getAll');
        targetProvider.organization = angular.copy(SAMPLE_ORGANIZATION);
        targetProvider.empty = false;

        createController();

        expect(getAllSpied.called).to.be.ok;
        expect(orgId).to.be.equal(SAMPLE_ORGANIZATION.guid);
        expect(scope.organization).to.be.deep.equal(SAMPLE_ORGANIZATION);
    });

    it('targetChanged, empty organization, do not get atk instances', function () {
        var getAllSpied = sinon.spy(atkInstancesResource, 'getAll');
        targetProvider.organization = {};
        targetProvider.empty = false;

        rootScope.$broadcast('targetChanged');

        expect(getAllSpied.called).to.be.not.ok;
    });

    it('init, Atk Client Resources set, get atk client', function()  {

        var getAllSpied = sinon.spy(atkClientResource, 'getOne');
        createController();

        expect(getAllSpied.called).to.be.ok;

    });

    it('init, get ATK Client success, set ATK Client link', function()  {

        var onSuccessCallback = null;
        atkClientResource.getOne = function(success) {
            onSuccessCallback = success;
        };

        createController();
        onSuccessCallback({
            file: "abcd.zip"
        });

        expect(scope.atkClientFile).to.be.equal("files/abcd.zip");
        expect(scope.clientState.value).to.be.equals(state.values.LOADED);
    });

    it('init, get ATK Client error, do not set ATK Client link', function()  {
        var onErrorCallback = null;
        atkClientResource.getOne = function(success, error) {
            onErrorCallback = error;
        };
        var showNotificationSpied = sinon.spy(notificationService, 'error');

        createController();
        onErrorCallback();

        expect(showNotificationSpied.called).to.be.ok;
        expect(scope.clientState.value).to.be.equals(state.values.PENDING);

    });

    it('targetChanged, get atk instances', function () {
        var orgId = null;
        atkInstancesResource.getAll = function(_orgId) {
            orgId = _orgId;
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        };
        var getAllSpied = sinon.spy(atkInstancesResource, 'getAll');
        targetProvider.organization = angular.copy(SAMPLE_ORGANIZATION);
        targetProvider.empty = false;

        rootScope.$broadcast('targetChanged');

        expect(getAllSpied.called).to.be.ok;
        expect(orgId).to.be.equal(SAMPLE_ORGANIZATION.guid);
    });

    it('get atkInstances success, set status loaded', function () {
        loadAtkInstances();

        expect(scope.state.value).to.be.equal(state.values.LOADED);
        expect(scope.instances).to.be.deep.equal(SAMPLE_ATK_RESPONSE.instances);
    });

    it('createNewInstance, send request and show information', function () {
        var name = "fakeinstance";
        loadAtkInstances();

        var postDeferred = $q.defer();
        serviceInstanceResource.createInstance = sinon.stub().returns(postDeferred.promise);
        postDeferred.resolve();
        var showNotificationSpied = sinon.spy(notificationService, 'success');

        scope.createInstance(name);

        rootScope.$digest();

        expect(showNotificationSpied.called, 'show notification').to.be.ok;
        var post = {
            name: name,
            organization_guid: SAMPLE_ORGANIZATION.guid,
            service_plan_guid: SAMPLE_ATK_RESPONSE.service_plan_guid,
            space_guid: SAMPLE_SPACE.guid,
        };

        expect(serviceInstanceResource.createInstance.called, 'call create service').to.be.ok;
        expect(serviceInstanceResource.createInstance.calledWith(post.name, post.service_plan_guid,
            post.organization_guid, post.space_guid), 'call create service with proper arguments').to.be.ok;
    });

    it('createNewInstance, success, set pending and load atk instances', function () {
        var name = "fakeinstance";
        loadAtkInstances();

        var postDeferred = $q.defer();
        serviceInstanceResource.createInstance = sinon.stub().returns(postDeferred.promise);
        postDeferred.resolve();

        atkInstancesResource.getAll = sinon.stub().returns($q.defer().promise);

        scope.createInstance(name);
        scope.$apply();
        expect(scope.state.value).to.be.equal(state.values.PENDING);
        expect(atkInstancesResource.getAll.called).to.be.ok;
    });

    function loadAtkInstances() {
        var deferred = $q.defer();
        atkInstancesResource.getAll = function() {
            return deferred.promise;
        };
        targetProvider.organization = angular.copy(SAMPLE_ORGANIZATION);
        targetProvider.space = angular.copy(SAMPLE_SPACE);
        targetProvider.empty = false;

        rootScope.$broadcast('targetChanged');
        deferred.resolve(SAMPLE_ATK_RESPONSE);
        scope.$apply();
    }
});
