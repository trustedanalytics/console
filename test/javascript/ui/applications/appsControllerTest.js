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
            getAll: sinon.stub().returns($q.defer().promise),
            withErrorMessage: function() {
                return this;
            }
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
        console.log(createController());
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

});
