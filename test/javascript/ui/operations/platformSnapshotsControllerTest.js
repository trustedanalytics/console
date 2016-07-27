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

describe("Unit: PlatformSnapshotsController", function() {

    beforeEach(module('app'));

    var controller,
        scope,
        versionTrackingResource,
        defer,
        $q;

    beforeEach(inject(function ($controller, $rootScope, _$q_, State) {
        scope = $rootScope.$new();
        $q = _$q_;
        state = new State();
        createController = function () {
            controller = $controller('PlatformSnapshotsController', {
                $scope: scope,
                VersionTrackingResource: versionTrackingResource
            });
        };

        defer = $q.defer();

        versionTrackingResource = {
            getSnapshots: sinon.stub().returns($q.defer().promise)
        };

    }));

    it('should not be null', function () {
        controller = createController();
        expect(controller).not.to.be.null;
    });

    it('init, set pending and get snapshots method call', function () {
        createController();
        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(versionTrackingResource.getSnapshots).to.be.called;
    });

    it('getSnapshots success, set state on loaded', function() {
        var deferSnapshot = $q.defer();
        versionTrackingResource.getSnapshots = sinon.stub().returns(deferSnapshot.promise);
        deferSnapshot.resolve({"id": "1"});
        createController();
        scope.$digest();
        expect(scope.state.value).to.be.equals(scope.state.values.LOADED);
    });

    it('getSnapshots error, set state on error', function() {
        var deferSnapshot = $q.defer();
        versionTrackingResource.getSnapshots = sinon.stub().returns(deferSnapshot.promise);
        deferSnapshot.reject();
        createController();
        scope.$digest();
        expect(scope.state.value).to.be.equals(scope.state.values.ERROR);
    });

});