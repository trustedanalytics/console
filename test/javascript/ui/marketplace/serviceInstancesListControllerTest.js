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
        ServiceInstancesResource,
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

        ServiceInstancesResource = {
            withErrorMessage: sinon.stub().returnsThis(),
            getSummary: sinon.stub().returns($q.defer().promise)
        };

        NotificationService = {
            error: sinon.stub()
        };

        createController = function() {
            scope = $rootScope.$new();
            sut = $controller('ServiceInstancesListController', {
                $scope: scope,
                State: State,
                targetProvider: targetProvider,
                ServiceInstancesResource: ServiceInstancesResource,
                NotificationService: NotificationService,
                blobFilter: sinon.stub()
            });
            scope.$apply();
        };
    }));

    it('init, set state pending get summary', function() {
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ServiceInstancesResource.withErrorMessage).to.be.called;
        expect(ServiceInstancesResource.getSummary).to.be.calledWith(space.guid);
    });

    it('init, empty space, set state pending do not get get summary', function() {
        targetProvider.getSpace = sinon.stub().returns({});
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ServiceInstancesResource.getSummary).not.to.be.called;
    });

    it('targetChanged, set state pending and get summary again', function() {
        createController();
        var newSpace = { guid: 'space-2' };
        targetProvider.getSpace = sinon.stub().returns(newSpace);

        scope.$emit('targetChanged');

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ServiceInstancesResource.getSummary).to.be.calledTwice;
    });


    it('getSummary, success, set state loaded and data', function() {
        var services = getServices();
        ServiceInstancesResource.getSummary = sinon.stub().returns(getResolvedPromise(services));

        createController();

        expect(scope.state.isLoaded(), 'loaded').to.be.true;
        expect(scope.services.length).to.be.equal(services.length);
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

        expect(scope.exports).to.be.empty;
        expect(scope.vcap).to.be.empty;
    });

    it('getSummary, error, set state loaded and show error', function() {
        var deferred = $q.defer();
        ServiceInstancesResource.getSummary = sinon.stub().returns(deferred.promise);

        createController();
        deferred.reject();
        scope.$apply();

        expect(scope.state.isLoaded(), 'loaded').to.be.true;
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
                    }
                }]
            }, {
                label: 'service2',
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
