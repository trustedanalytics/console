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
describe("Unit: LatestEventsController", function() {

    var controller, scope, eventsResource, deferred, rootScope, params, provider;
    beforeEach(module('app'));

    beforeEach(inject(function($controller, $rootScope, $q, EventsResource, targetProvider) {

        deferred = $q.defer();

        eventsResource = EventsResource;
        eventsResource.getPage = sinon.stub().returns(deferred.promise);

        provider = targetProvider;
        provider.getOrganization = sinon.stub().returns(deferred.promise);

        params = {
            page: function() {return 1;},
            count: function() {return 2;},
            total: function(total) {}
        };

        scope = $rootScope.$new();
        rootScope = $rootScope;

        createController = function () {
            controller = $controller('LatestEventsController', {
                $scope: scope,
                EventsResource: eventsResource,
                targetProvider: provider
            });
        };
    }));

    it('should execute getPage initially', function() {
        createController();
        rootScope.$digest();

        scope.collectData(deferred, params);

        expect(eventsResource.getPage.called).to.be.true;
        expect(scope.state.isPending()).to.be.true;
    });

    it('should be loaded after successfull getPage', function() {

        createController();

        var toReturn = {
            events:[],
            total: 0
        };

        toReturn.plain = function(){return this;};

        scope.collectData(deferred, params);
        deferred.resolve(toReturn);
        rootScope.$digest();

        expect(scope.state.isLoaded()).to.be.true;
    });

    it('should ask for organization Id', function() {
        createController();

        scope.collectData(deferred, params);

        expect(provider.getOrganization.called).to.be.true;
    });
});
