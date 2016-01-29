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
/* jshint -W030 */
describe("Unit: DashboardController", function () {

    var sut,
        scope,
        createController,
        targetProvider,
        OrgMetricsResource,
        LoadChartResource,
        $q;

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    beforeEach(inject(function ($controller, $rootScope, _$q_) {
        scope = $rootScope.$new();
        $q = _$q_;

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o1' }),
            getOrganizations: sinon.stub()

        };

        LoadChartResource = {
            supressGenericError: sinon.stub().returnsThis(),
            getChart: sinon.stub().returns($q.defer().promise)
        };

        OrgMetricsResource = {
            getMetrics: sinon.stub().returns($q.defer().promise)
        };

        createController = function () {
            sut = $controller('DashboardController', {
                $scope: scope,
                targetProvider: targetProvider,
                LoadChartResource: LoadChartResource,
                OrgMetricsResource: OrgMetricsResource
            });
        };
    }));

    it('should not be null', function () {
        createController();

        expect(sut).not.to.be.null;
    });

    it('init, set pending and call metrics with load', function () {
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(OrgMetricsResource.getMetrics).to.be.called;
        expect(LoadChartResource.getChart).to.be.called;
    });

    it('init, empty organization, do not call metrics', function () {
        targetProvider.getOrganization = sinon.stub.returns({});
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(OrgMetricsResource.getMetrics).not.to.be.called;
    });

    it('targetChanged, get metrics', function () {
        createController();

        scope.$emit('targetChanged');

        expect(OrgMetricsResource.getMetrics).to.be.calledTwice;
        expect(LoadChartResource.getChart).to.be.calledOnce;
    });

    it('targetChanged, empty organization, do not get metrics', function () {
        targetProvider.getOrganization = sinon.stub.returns({});
        createController();

        scope.$emit('targetChanged');

        expect(OrgMetricsResource.getMetrics).not.to.be.called;
    });
});
