/**
 * Copyright (c) 2016 Intel Corporation
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

describe("Unit: DocumentationController", function () {

    var controller,
        rootScope,
        scope,
        state,
        $q,
        versionResource,
        createController,
        deferred;

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $rootScope, _$q_, State) {
        rootScope = $rootScope;
        scope = rootScope.$new();
        $q = _$q_;
        state = new State();
        deferred = $q.defer();

        versionResource = {
            getSnapshots: sinon.stub().returns(deferred.promise)
        };

        createController = function () {
            controller = $controller('DocumentationController', {
                $scope: scope,
                VersionResource: versionResource
            });
        };

        createController();
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, set state pending', function () {
        expect(scope.state.value).to.be.equals(state.values.PENDING);
    });

    it('init, getSnapshots called', function () {
        expect(versionResource.getSnapshots.called).to.be.ok;
    });

    it('getSnapshots, success, set state on loaded', function () {
        deferred.resolve({response: 'blabla'});
        scope.$digest();
        expect(scope.state.value).to.be.equals(scope.state.values.LOADED);
    });

    it('getSnapshots, reject, set state on error', function () {
        deferred.reject();
        scope.$digest();
        expect(scope.state.value).to.be.equals(scope.state.values.LOADED);
    });
});