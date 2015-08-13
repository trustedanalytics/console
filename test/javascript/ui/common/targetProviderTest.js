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
describe("Unit: TargetProvider", function() {
    var SPACE_KEY = 'space',
        ORGANIZATION_KEY = 'organization',

        $injector,
        $cookies,
        $rootScope,
        $provide,
        $q,
        fullList = [{
            "guid" : "87399f31-4b06-4885-bd2e-99e9a12b296d",
            "name" : "trololo",
            "spaces" : [{
                "guid" : "f5dc2949-0133-4910-b6b1-fcb059537fab",
                "name" : "lalalala"
            }],
            "manager" : true
        },
        {
            "guid" : "a1bbc261-262e-484b-81d6-8c0751cf2876",
            "name" : "andrzejowo-dolne",
            "spaces" : [{
                "guid" : "36b8d0a8-03b5-4865-9ee2-d3b8b4e3fb27",
                "name" : "default"
                }, {
                    "guid" : "c360da3a-00c2-4985-8acf-787df700c12a",
                    "name" : "andrzejowa"
            }],
            "manager" : false
        },
        {
            "guid" : "b39f9896-8284-4460-a34c-e979a6763800",
            "name" : "testorg",
            "spaces" : [{
                "guid" : "264970e5-4384-49a9-ac74-1e3cf9e9f18f",
                "name" : "testspace"
            }],
            "manager" : false
        }];

    beforeEach(module('app', function(_$provide_){
        $provide = _$provide_;
    }));



    beforeEach(inject(function(_$injector_, _$cookies_, _$rootScope_, _$q_) {
        $injector = _$injector_;
        $cookies = _$cookies_;
        $rootScope = _$rootScope_;
        $q = _$q_;

        $cookies.remove(ORGANIZATION_KEY);
        $cookies.remove(SPACE_KEY);
    }));

    function getSUT() {
        var deferred = $q.defer();
        $provide.value('OrganizationResource', {
            getList: function() {
                return deferred.promise;
            },
            withErrorMessage: function() {
                return this;
            }
        });
        $provide.value('NotificationService', sinon.stub());
        var targetProvider = $injector.get('targetProvider');
        deferred.resolve(fullList);

        return targetProvider;
    }

    it('getOrganization when cookie is not set should return first organization ', inject(function() {
        var targetProvider = getSUT();

        var org = targetProvider.getOrganization();
        $rootScope.$digest();

        expect(org).to.be.deep.equal(fullList[0]);

    }));

    it('getOrganization when cookie is set to deleted organization should return first organization', inject(function($cookies) {
        var targetProvider = getSUT();
        $cookies.putObject(ORGANIZATION_KEY, {guid: "1234"});
        var org = targetProvider.getOrganization();
        $rootScope.$digest();

        expect(org).to.be.deep.equal(fullList[0]);

    }));

    it('getOrganization  when cookie is set should return proper organization', inject(function() {
        $cookies.putObject(ORGANIZATION_KEY, {
            guid: "b39f9896-8284-4460-a34c-e979a6763800"
        });

        var targetProvider = getSUT();
        var org = targetProvider.getOrganization();
        $rootScope.$digest();

        expect(org).to.be.deep.equal(fullList[2]);
    }));

    it('setOrganization should store organization in cookie and fire event', inject(function() {
        var targetProvider = getSUT();
        var broadcast = sinon.spy($rootScope, '$broadcast');
        targetProvider.setOrganization(fullList[1]);

        expect(broadcast.calledOnce).to.be.true;
        expect($cookies.getObject(ORGANIZATION_KEY)).to.be.deep.equal(fullList[1]);
        expect($cookies.getObject(SPACE_KEY)).to.be.deep.equal(fullList[1].spaces[0]);

    }));


    it('setOrganization with mute events should store organization in cookie and not fire event', inject(function() {
        var targetProvider = getSUT();
        var broadcast = sinon.spy($rootScope, '$broadcast');
        targetProvider.setOrganization(fullList[1], true);

        expect(broadcast.callCount).to.be.equal(0);
        expect($cookies.getObject(ORGANIZATION_KEY)).to.be.deep.equal(fullList[1]);
        expect($cookies.getObject(SPACE_KEY)).to.be.deep.equal(fullList[1].spaces[0]);

    }));

    it('setSpace should store space in cookie and fire event', inject(function() {
        var space = fullList[1].spaces[0];
        var targetProvider = getSUT();
        var broadcast = sinon.spy($rootScope, '$broadcast');
        targetProvider.setSpace(space);

        expect(broadcast.calledOnce).to.be.true;
        expect($cookies.getObject(SPACE_KEY)).to.be.deep.equal(space);

    }));

    it('getOrganizations should get organization list', inject(function() {

        var targetProvider = getSUT();
        var orgs = targetProvider.getOrganizations();
        $rootScope.$digest();

        expect(angular.fromJson(angular.toJson(orgs))).to.be.deep.equal(fullList);
    }));

    it('getOrganizations should display an error if organization list is empty', inject(function($httpBackend) {

        var deferred = $q.defer();
        var emptyOrganizationsError = 'You are not assigned to any organization. Contact administrators.';
        var notificationServiceStub = {
            error: sinon.stub(),
            $rootScope: sinon.stub()
        };
        $provide.value('NotificationService', notificationServiceStub);
        $provide.value('OrganizationResource', {
            getList: function() {
                return deferred.promise;
            },
            withErrorMessage: function() {
                return this;
            }
        });
        var targetProvider = $injector.get('targetProvider');
        deferred.resolve([]);

        var orgs = targetProvider.getOrganizations();
        $rootScope.$digest();

        expect(orgs).to.be.deep.equal([]);
        expect(notificationServiceStub.error.called).to.equal(true);
        expect(notificationServiceStub.error.getCalls()[0].args[0]).to.deep.equal(emptyOrganizationsError);
    }));

});
