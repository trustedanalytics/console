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

describe("Unit: PlatformSnapshotController", function() {

    beforeEach(module('app'));

    var controller,
        scope,
        platformSnapshotResource,
        defer,
        $q;

    beforeEach(inject(function ($controller, $rootScope, _$q_, State) {
        scope = $rootScope.$new();
        $q = _$q_;
        state = new State();
        createController = function () {
            controller = $controller('PlatformSnapshotController', {
                $scope: scope,
                PlatformSnapshotResource: platformSnapshotResource
            });
        };

        defer = $q.defer();

        platformSnapshotResource = {
            getSnapshots: sinon.stub().returns($q.defer().promise),
            getConfiguration: sinon.stub().returns($q.defer().promise)
        };

    }));

    it('should not be null', function () {
        controller = createController();
        expect(controller).not.to.be.null;
    });

    it('init, set pending and get snapshots', function () {
        createController();
        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(platformSnapshotResource.getConfiguration).to.be.called;
    });

    it('getConfiguration success, set state on loaded', function() {
        var deferConfig = $q.defer();
        var deferSnapshot = $q.defer();
        platformSnapshotResource.getConfiguration = sinon.stub().returns(deferConfig.promise);
        deferConfig.resolve({"scopes": ["core","other","all"]});
        platformSnapshotResource.getSnapshots = sinon.stub().returns(deferSnapshot.promise);
        deferSnapshot.resolve({"id": "1"});
        createController();
        scope.$digest();
        expect(scope.state.value).to.be.equals(scope.state.values.LOADED);
    });

});