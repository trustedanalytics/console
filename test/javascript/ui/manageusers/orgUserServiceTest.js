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
describe("Unit: orgUserService", function () {

    var $httpBackend;
    var orgUserServiceSUT;
    var targetProviderStub;
    var $rootScope;
    beforeEach(module('app'));

    beforeEach(module(function($provide){
        targetProviderStub = {}
        $provide.value('targetProvider', targetProviderStub);
    }));

    beforeEach(inject(function (_orgUserService_, $injector, _$httpBackend_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        orgUserServiceSUT = _orgUserService_;
        $rootScope = _$rootScope_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should call for users from apropriate organization on refresh', inject(function () {
        targetProviderStub.getOrganization = sinon.stub().returns({ guid: "1234" });

        var callbackSpied = sinon.stub();
        $httpBackend.expectGET('/rest/orgs/1234/users').respond(200, []);

        orgUserServiceSUT.getAll()
            .then(callbackSpied);
        $httpBackend.flush();

        expect(callbackSpied.called).to.be.true;
    }));

    it('should fail while calling for users form unavailable organization on refresh', inject(function () {
        targetProviderStub.getOrganization = sinon.stub().returns(null);

        var errcallbackSpied = sinon.stub();

        orgUserServiceSUT.getAll().catch(errcallbackSpied);

        $rootScope.$digest();
        expect(errcallbackSpied.called).to.be.true;
    }));

    it('should send POST on adding user', inject(function () {
        var user = {
          username: "waclaw",
          roles: ["manager"]
        };

        targetProviderStub.getOrganization = sinon.stub().returns({ guid: "1234" });

        $httpBackend.expectPOST('/rest/orgs/1234/users').respond(201, {});

        var callbackSpied = sinon.stub();
        orgUserServiceSUT.addUser(user).then(callbackSpied);
        $httpBackend.flush();
        expect(callbackSpied.called).to.be.true;
    }));
});
