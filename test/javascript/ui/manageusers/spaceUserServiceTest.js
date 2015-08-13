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
describe("Unit: spaceUserService", function () {

    var $httpBackend;
    var spaceUserServiceSUT;
    var targetProviderStub;
    var $rootScope;
    beforeEach(module('app'));


    beforeEach(module(function($provide){
        targetProviderStub = {}
        $provide.value('targetProvider', targetProviderStub);
    }));

    beforeEach(inject(function (_spaceUserService_, $injector, _$httpBackend_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        spaceUserServiceSUT = _spaceUserService_;
        $rootScope = _$rootScope_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should call for users from apropriate space on refresh', inject(function ($injector) {
        targetProviderStub.getSpace = sinon.stub().returns({guid: "1234"});

        var callback = sinon.stub();
        $httpBackend.expectGET('/rest/spaces/1234/users').respond(200, []);

        spaceUserServiceSUT.getAll().then(callback);
        $httpBackend.flush();

        expect(callback.called).to.be.true;
    }));

    it('should fail while calling for users form unavailable space on refresh', inject(function ($injector) {
        targetProviderStub.getSpace = sinon.stub().returns(null);

        var errcallback = sinon.stub();

        spaceUserServiceSUT.getAll().catch(errcallback);
        $rootScope.$digest();
        expect(errcallback.called).to.be.true;
    }));


});
