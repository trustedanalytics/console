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
describe("Unit: ServiceInstancesListController", function () {

    var sut,
        scope,
        targetProvider,
        UserProvider,
        ServiceInstancesResource,
        ServiceKeysResource,
        KubernetesServicesResource,
        NotificationService,
        state,
        $q,
        space = Object.freeze({
            guid: 'space-0123'
        }),

        createController;

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $rootScope, State, _$q_) {
        $q = _$q_;
        state = new State();
        targetProvider = {
            getSpace: sinon.stub().returns(space),
            getOrganization: sinon.stub().returns({})
        };

        UserProvider = {
            isAdmin: sinon.stub().returns(getResolvedPromise("USER"))
        };

        ServiceInstancesResource = {
            withErrorMessage: sinon.stub().returnsThis(),
            getSummary: sinon.stub().returns($q.defer().promise)
        };

        ServiceKeysResource = {
            withErrorMessage: sinon.stub().returnsThis(),
            addKey: sinon.stub().returns($q.defer().promise),
            deleteKey: sinon.stub().returns($q.defer().promise)
        };

        KubernetesServicesResource = {
            withErrorMessage: sinon.stub().returnsThis(),
            services: sinon.stub().returns($q.defer().promise),
            setVisibility: sinon.stub().returns($q.defer().promise),
        }

        NotificationService = {
            error: sinon.stub(),
            success: sinon.stub(),
            confirm: sinon.stub().returns($q.defer().promise)
        };

        createController = function() {
            scope = $rootScope.$new();
            sut = $controller('ServiceInstancesListController', {
                $scope: scope,
                State: State,
                targetProvider: targetProvider,
                ServiceInstancesResource: ServiceInstancesResource,
                ServiceKeysResource: ServiceKeysResource,
                KubernetesServicesResource: KubernetesServicesResource,
                NotificationService: NotificationService,
                blobFilter: sinon.stub(),
                UserProvider: UserProvider
            });
            scope.$apply();
        };
    }));

    it('init, set state pending and get summary', function() {
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(UserProvider.isAdmin).to.be.called;
        expect(ServiceInstancesResource.withErrorMessage).to.be.called;
        expect(ServiceInstancesResource.getSummary).to.be.calledWith(space.guid);
    });

    it('init, empty space, set state pending do not get get summary', function() {
        targetProvider.getSpace = sinon.stub().returns({});
        createController();

        expect(UserProvider.isAdmin).to.be.called;
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
        expect(ServiceInstancesResource.getSummary).not.to.be.called;
    });

    it('targetChanged, set state pending and get summary again', function() {
        createController();
        var newSpace = { guid: 'space-2' };
        targetProvider.getSpace = sinon.stub().returns(newSpace);

        scope.$emit('targetChanged');

        expect(UserProvider.isAdmin).to.be.called;
        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ServiceInstancesResource.getSummary).to.be.calledTwice;
    });


    it('getSummary, success, set state loaded and data', function() {
        var services = getServices();
        ServiceInstancesResource.getSummary = sinon.stub().returns(getResolvedPromise(services));

        createController();

        expect(UserProvider.isAdmin).to.be.called;
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
        expect(scope.services.length).to.be.equal(2);
        expect(scope.services[0].like).to.be.equal('bananas');
        expect(scope.services[0].label).to.be.equal('service1-extra');
        expect(scope.services[0].tags.length).to.be.equal(2);
    });

    it('addExport, add instance to exports', function() {
        var services = getServices();
        var keys = getSampleKeys();
        ServiceInstancesResource.getSummary = sinon.stub().returns(getResolvedPromise(services));

        createController();
        scope.addExport(keys[0]);
        scope.addExport(keys[1]);

        expect(UserProvider.isAdmin).to.be.called;
        expect(scope.exports).to.be.deep.equal(keys);
        expect(scope.vcap['service1-extra'].length).to.be.deep.equal(2);
    });

    it('targetChanged, empty exports and vcap', function() {
        var services = getServices();
        var keys = getSampleKeys();
        ServiceInstancesResource.getSummary = sinon.stub().returns(getResolvedPromise(services));

        createController();
        scope.addExport(keys[0]);
        scope.$emit('targetChanged');

        expect(UserProvider.isAdmin).to.be.called;
        expect(scope.exports).to.be.empty;
        expect(scope.vcap).to.be.empty;
    });

    it('getSummary, error, set state loaded and show error', function() {
        var deferred = $q.defer();
        ServiceInstancesResource.getSummary = sinon.stub().returns(deferred.promise);

        createController();
        deferred.reject();
        scope.$apply();

        expect(UserProvider.isAdmin).to.be.called;
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
    });

    it('addKey, post new resource', function() {
        createController();
        scope.addKey('banana', {guid: 'test-guid'});

        expect(ServiceKeysResource.addKey).to.be.called;
        expect(ServiceKeysResource.addKey).to.be.calledWith('banana', 'test-guid');
        expect(scope.state.isPending(), 'pending').to.be.ok;
    });

    it('addKey, failed, do not refresh instances list', function() {
        var deferred = $q.defer();
        ServiceKeysResource.addKey = sinon.stub().returns(deferred.promise);

        createController();
        scope.addKey('banana', {guid: 'test-guid'});
        deferred.reject();
        scope.$apply();

        expect(ServiceInstancesResource.getSummary).to.be.calledOnce;
        expect(scope.state.isLoaded(), 'loaded').to.be.ok;
    });

    it('addKey, success, refresh instances list', function() {
        var deferred = $q.defer();
        ServiceKeysResource.addKey = sinon.stub().returns(deferred.promise);

        createController();
        scope.addKey('banana', {guid: 'test-guid'});
        deferred.resolve();
        scope.$apply();

        expect(ServiceInstancesResource.getSummary).to.be.calledTwice;
    });

    it('deleteKey, show confirmation dialog', function() {
        createController();
        scope.deleteKey({guid: 'test-guid'});

        expect(NotificationService.confirm).to.be.called;
    });

    it('deleteKey, confirmed, delete key resource', function() {
        var deferred = $q.defer();
        NotificationService.confirm = sinon.stub().returns(deferred.promise);

        createController();
        scope.state.setLoaded();

        scope.deleteKey({guid: 'test-guid'});
        deferred.resolve();
        scope.$apply();

        expect(ServiceKeysResource.deleteKey).to.be.called;
        expect(ServiceKeysResource.deleteKey).to.be.calledWith('test-guid');
        expect(scope.state.isPending(), 'pending').to.be.ok;
    });

    it('deleteKey, confirmed and success, refresh instances', function() {
        var confirmDeferred = $q.defer();
        NotificationService.confirm = sinon.stub().returns(confirmDeferred.promise);
        var deleteDeferred = $q.defer();
        ServiceKeysResource.deleteKey = sinon.stub().returns(deleteDeferred.promise);

        createController();
        scope.deleteKey({guid: 'test-guid'});
        confirmDeferred.resolve();
        deleteDeferred.resolve();
        scope.$apply();

        expect(ServiceInstancesResource.getSummary).to.be.calledTwice;
    });

    function getSampleKeys() {
        return [{
            service_instance_guid: 'i1',
            credentials: { user: 'u', password: 'p' }
        }, {
            service_instance_guid: 'i1',
            credentials: { user: 'u2', password: 'p2' }
        }];
    }

    function getServices() {
        return [
            {
                guid: 's1',
                label: 'service1',
                tags: [
                    't1', 't2', 't3'
                ],
                extra: '{"label":"service1-extra","tags":["t1-extra","t2-extra"],"like":"bananas"}',
                instances: [{
                    guid: 'i1',
                    name: 'inst1',
                    service_guid: 's1',
                    service_keys: getSampleKeys(),
                    service_plan: {
                        name: 'free'
                    },
                    last_operation: {state: "succeeded"}
                }]
            }, {
                guid: 's2',
                label: 'service2',
                tags: [
                    't1', 't2', 't3'
                ],
                extra: '{"label":"service1-extra","tags":["t1-extra","t2-extra"],"like":"bananas"}',
                instances: [{
                    guid: 'i1',
                    name: 'inst1',
                    service_guid: 's1',
                    service_keys: getSampleKeys(),
                    service_plan: {
                        name: 'free'
                    },
                    last_operation: {state: "succeeded"}
                }]
            }, {
                label: 'service3',
                tags: []
            }
        ];
    }

    function getResolvedPromise(data) {
        var deferred = $q.defer();
        deferred.resolve(data);
        return deferred.promise;
    }

});