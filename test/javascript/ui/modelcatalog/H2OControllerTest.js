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

describe("Unit: H2OModelsController", function() {

    var controller,
        scope,
        ModelResource,
        h2oPublisherResource,
        targetProvider,
        notificationService,
        state,
        $q;

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    beforeEach(inject(function ($controller, $rootScope, _$q_, State) {
        scope = $rootScope.$new();
        $q = _$q_;
        state = new State();

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o1' })
        };

        createController = function () {
            controller = $controller('H2OModelsController', {
                $scope: scope,
                targetProvider: targetProvider,
                ModelResource: ModelResource,
                H2OPublisherResource: h2oPublisherResource,
                NotificationService: notificationService
            });
        };

        ModelResource = {
            getInstances: sinon.stub().returns($q.defer().promise)
        };

        h2oPublisherResource = {
            withErrorMessage: function () {
                return this;
            },
            postDataModel: sinon.stub().returns($q.defer().promise)
        };

        notificationService = {
            success: function() {}
        };

    }));

    it('should not be null', function () {
        createController();
        expect(controller).not.to.be.null;
    });

    it('init, set pending and get instances', function () {
        createController();
        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ModelResource.getInstances).to.be.called;
    });

    it('targetChanged, get instances', function () {
        createController();

        scope.$emit('targetChanged');

        expect(ModelResource.getInstances).to.be.calledTwice;
    });

    it('publish, success, set state on loaded', function () {
        createController();

        var publishDefferred = $q.defer();
        var successSpied = sinon.spy(notificationService, 'success');
        h2oPublisherResource.postDataModel = sinon.stub().returns(publishDefferred.promise);
        publishDefferred.resolve();
        scope.publish();
        scope.$digest();
        expect(successSpied.called).to.be.true;
        expect(scope.state.value).to.be.equals(scope.state.values.LOADED);
    });

    it('publish, error, set state on error', function () {
        createController();

        var publishDefferred = $q.defer();
        h2oPublisherResource.postDataModel = sinon.stub().returns(publishDefferred.promise);
        publishDefferred.reject();
        scope.publish();
        scope.$digest();
        expect(scope.state.value).to.be.equals(scope.state.values.ERROR);
    });

});