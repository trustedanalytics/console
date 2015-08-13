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
describe("Unit: ServicesController", function () {

    var controller,
        httpBackend,
        rootScope,
        _serviceExtractor,
        createController,
        ServiceResource,
        serviceListDeferred,
        _targetUrlBuilder,
        SERVICES_URL = '/mocked/services/url',
        targetProvider = {},
        state,
        scope;

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    beforeEach(inject(function ($controller, $location, $httpBackend, $rootScope, serviceExtractor,
                                targetUrlBuilder, TestHelpers, _ServiceResource_, $q) {
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        ServiceResource = _ServiceResource_;
        _serviceExtractor = serviceExtractor;
        _targetUrlBuilder = targetUrlBuilder;
        _targetUrlBuilder.get = function() {
            return SERVICES_URL;
        };
        new TestHelpers().stubTargetProvider(targetProvider);

        serviceListDeferred = $q.defer();
        ServiceResource.getListBySpace = sinon.stub().returns(serviceListDeferred.promise);
        scope = rootScope.$new();

        createController = function () {
            controller = $controller('ServicesController', {
                serviceExtractor: serviceExtractor,
                $scope: scope
            });
            state = controller.state;
        };
    }));

    beforeEach(function () {
        _serviceExtractor.extract = function () {
            return [serviceSample];
        };
    });

    it('should not be null', function () {
        expect(createController()).not.to.be.null;
    });

    it('init should get services when space is not empty', function () {
        targetProvider.setSpace({guid: 'testing'});
        createController();
        serviceListDeferred.resolve([serviceSample]);
        rootScope.$digest();
        expect(controller.services).to.deep.have.members([serviceSample]);
    });

    it('init should not get services when space is empty', function () {
        createController();
        serviceListDeferred.resolve([serviceSample]);
        rootScope.$digest();
        expect(controller.services).not.to.deep.have.members([serviceSample]);
    });

    it('init should set status pending when space is not empty', function () {
        targetProvider.setSpace({guid: 'testing'});
        createController();
        expect(state.value).to.be.equals(state.values.PENDING);
    });

    it('init should set status loaded when space is empty', function () {
        createController();
        expect(state.value).to.be.equals(state.values.LOADED);
    });

    it('init, got services, set status loaded', function () {
        createController();
        serviceListDeferred.resolve([serviceSample]);
        rootScope.$digest();
        expect(state.value).to.be.equals(state.values.LOADED);
    });

    it('init, got error, set status error if space is not empty', function () {
        targetProvider.setSpace({guid: 'testing'});
        controller = createController();
        serviceListDeferred.reject();
        rootScope.$digest();

        expect(state.value).to.be.equals(state.values.ERROR);
    });

    it('on targetChanged, get services again if space is not empty', function () {
        targetProvider.setSpace({guid: 'testing'});
        createController();

        rootScope.$broadcast('targetChanged');

        expect(ServiceResource.getListBySpace.calledTwice).to.be.true;
    });

    it('filterService: empty searchText, should find service', function () {
        createController();

        controller.searchText = "";
        var serviceMatches = controller.filterService(serviceSample);

        expect(serviceMatches).to.be.true;
    });

    it('filterService: name contains case insensitive string, should find service', function () {
        createController();

        controller.searchText = "service1";
        var serviceMatches = controller.filterService(serviceSample);

        expect(serviceMatches).to.be.true;
    });

    it('filterService: description contains case insensitive string, should find service', function () {
        createController();

        controller.searchText = "ONE";
        var serviceMatches = controller.filterService(serviceSample);

        expect(serviceMatches).to.be.true;
    });

    it('filterService: tags contains case insensitive string, should find service', function () {
        createController();

        controller.searchText = "Tag";
        var serviceMatches = controller.filterService(serviceSample);

        expect(serviceMatches).to.be.true;
    });

    it('filterService: tags contains case insensitive string, should find service', function () {
        createController();

        controller.searchText = "Tag";
        var serviceMatches = controller.filterService(serviceSample);

        expect(serviceMatches).to.be.true;
    });

    it('filterService: no property contains string, should not find service', function () {
        createController();

        scope.searchText = "asdasd";
        var serviceMatches = controller.filterService(serviceSample);

        expect(serviceMatches).to.be.false;
    });

    it('filterService: should not find in image', function () {
        createController();

        scope.searchText = "c29";
        var serviceMatches = controller.filterService(serviceSample);

        expect(serviceMatches).to.be.false;
    });

    var serviceSample = {
        name: 'SomeService1',
        image: 'c29tZSBleGFtcGxlIGJhc2U2NCBpbWFnZQ==',
        description: 'Service one description',
        tags: ['tag1', 'tag2']
    };
});
