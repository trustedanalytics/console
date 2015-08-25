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
describe("Unit: AppsController", function () {

    var controller,
        createController,
        applicationResource,
        atkInstanceResource,
        $rootScope,
        $q,
        _targetProvider,
        space = { guid: 's1', name: 'space1'},
        org = { guid: 'o1', name: 'org1' };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, TestHelpers, _$rootScope_, _$q_) {
        $rootScope = _$rootScope_;
        $q = _$q_;
        _targetProvider = (new TestHelpers()).stubTargetProvider({});
        _targetProvider.space = space;
        _targetProvider.org = org;

        applicationResource = {
            getAll: function() {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            },
            withErrorMessage: function() {
                return this;
            }
        };
        atkInstanceResource = {
            getAll: sinon.stub().returns($q.defer().promise)
        };

        createController = function () {
            controller = $controller('ApplicationsController', {
                targetProvider: _targetProvider,
                $scope: $rootScope.$new(),
                AtkInstanceResource: atkInstanceResource,
                ApplicationResource: applicationResource
            });
        };

    }));

    it('should not be null', function () {
        createController();
        expect(controller).not.to.be.null;
    });

    it('init, set state pending and request for applications', function () {
        createController();

        expect(controller.state, 'controller state').to.be.equal(controller.states.PENDING);
        expect(atkInstanceResource.getAll.calledOnce, 'getAtkInstances called').to.be.true;
    });

    it('init, empty space, do not request for applications', function () {
        _targetProvider.space = null;

        createController();

        expect(applicationResource.getAll.called).to.be.not.ok;
    });

    it('on targetChanged, get applications', function () {
        createController();
        $rootScope.$broadcast('targetChanged');

        expect(atkInstanceResource.getAll.called).to.be.true;
    });

    it('getApplication success, set applications and state loaded', function () {
        var applications = [
            { guid: 'a1'},
            { guid: 'a2' }
        ];

        var deferred = $q.defer();
        applicationResource.getAll = sinon.stub().returns(deferred.promise);
        deferred.resolve(applications);

        createController();
        $rootScope.$digest();

        expect(atkInstanceResource.calledOnce).to.be.equal.true;
        expect(controller.applications).to.be.deep.equal(applications);
        expect(controller.state, 'state').to.be.equal(controller.states.LOADED);
    });

    it('getAtkInstance error, set state error', function () {
        var deferred = $q.defer();
        deferred.reject();
        atkInstanceResource.getAll = sinon.stub().returns(deferred.promise);
        createController();
        $rootScope.$digest();

        expect(atkInstanceResource.calledOnce).to.be.equal.true;
        expect(controller.state, 'state').to.be.equal(controller.states.ERROR);
    });

    it('getApplication error, set state error', function () {
        var deferred = $q.defer();
        atkInstanceResource.getAll = function() {
            var deferred = $q.defer();
            deferred.reject();
            return deferred.promise;
        };
        applicationResource.getAll = sinon.stub().returns(deferred.promise);
        deferred.reject();
        createController();
        $rootScope.$digest();

        expect(atkInstanceResource.calledOnce).to.be.equal.true;
        expect(controller.state, 'state').to.be.equal(controller.states.ERROR);
    });

    it('prepareData, no params, return list as it is', function () {
        var params = paramsStub();
        var apps = getSampleApps();

        var result = controller.prepareData(apps, params);

        expect(result).to.be.deep.equal(apps);
    });

    it('prepareData, advancedsearch set, advancedsearch list', function () {
        var params = _.extend(paramsStub(), {
            filter: function() { return { name: 'filtered', state: 'start' }; }
        });
        var apps = getSampleApps();

        var result = controller.prepareData(apps, params);

        expect(result).to.be.deep.equal([
            apps[1],
            apps[2],
            apps[4]
        ]);
    });

    it('prepareData, advancedsearch and order set, advancedsearch and order list', function () {
        var params = _.extend(paramsStub(), {
            filter: function() { return { name: 'filtered', state: 'start' }; },
            sorting: function() { return true; },
            orderBy: function() { return '+name'; }
        });
        var apps = getSampleApps();

        var result = controller.prepareData(apps, params);

        expect(result).to.be.deep.equal([
            apps[4],
            apps[2],
            apps[1]
        ]);
    });

    it('prepareData, count 2, output first 2 results', function () {
        var params = _.extend(paramsStub(), {
            count: function() { return 2; }
        });
        var apps = getSampleApps();

        var result = controller.prepareData(apps, params);

        expect(result).to.be.deep.equal([
            apps[0],
            apps[1]
        ]);
    });

    it('prepareData, count 2 and page 2, output results 3-4', function () {
        var params = _.extend(paramsStub(), {
            count: function() { return 2; },
            page: function() { return 2; }
        });
        var apps = getSampleApps();

        var result = controller.prepareData(apps, params);

        expect(result).to.be.deep.equal([
            apps[2],
            apps[3]
        ]);
    });

    function paramsStub() {
        return {
            filter: function(){},
            sorting: function() {},
            total: function() {},
            page: function() { return 1;},
            count: function() { return 10; }
        };
    }

    function getSampleApps() {
        return [
            {"guid": "fa132957-00d7-43cc-92dd-cea8396a1e01", "urls": ["a.example.com"], "running_instances": 0, "service_names": [], "name": "a", "state": "STOPPED"},
            {"guid": "eb41a02f-7ef8-4340-b1ad-0cd01678b668", "urls": ["b.example.com"], "running_instances": 1, "service_names": [], "name": "filtered-app-3", "state": "STARTED"},
            {"guid": "5459de2a-3d3a-44c6-a774-a12e72a58d50", "urls": ["c.example.com"], "running_instances": 1, "service_names": [], "name": "filtered-app-2", "state": "STARTED"},
            {"guid": "d954e443-567b-4cd8-a1a1-d5ab46e662a6", "urls": ["d.example.com"], "running_instances": 1, "service_names": [], "name": "d-app", "state": "STARTED"},
            {"guid": "9b0a7cbb-2962-4627-940a-26ad05223bc9", "urls": ["e.example.com"], "running_instances": 1, "service_names": [], "name": "filtered-app-1", "state": "STARTED"}
        ];
    }

});
