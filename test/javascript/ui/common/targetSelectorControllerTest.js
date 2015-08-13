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
describe("Unit: TargetSelectorController", function() {
    var allOrgs = [
        {
            name: 'org1',
            guid: 'guid1',
            manager: true
        },
        {
            name: 'org2',
            guid: 'guid2'
        }
    ];
    var targetProvider;
    var $controller;
    var scope;
    var UserProvider;

    beforeEach(module('app'));

    beforeEach(inject(function(_$controller_, $rootScope) {
        $controller = _$controller_;
        scope = $rootScope.$new();
        targetProvider = {
            getOrganizations: function() {
                return allOrgs;
            },
            getOrganization: function() {
                return allOrgs[0];
            },
            setOrganization: sinon.stub(),
            getSpace: sinon.stub(),
            getSpaces: sinon.stub()
        };
        UserProvider = {
            getUser: function(callback){
                callback({role: 'USER'});
            }

        }

    }));

    function getSUT() {
        return $controller('TargetSelectorController', {
            targetProvider: targetProvider,
            $scope: scope,
            UserProvider: UserProvider
        });
    }

    it('should return all organizations if managedOnly attribute is not set', function() {
        var sut = getSUT();
        expect(sut.organization.selected).to.be.deep.equals(allOrgs[0]);
        expect(sut.organization.available).to.be.deep.equals(allOrgs);
        expect(targetProvider.getSpace.called).to.be.true;
        expect(targetProvider.getSpaces.called).to.be.true;
    });

    it('should return managed organizations if managedOnly attribute is set', function() {
        scope.managedOnly = 'managed-only';

        var sut = getSUT();
        scope.$digest();
        expect(sut.organization.selected).to.be.deep.equals(allOrgs[0]);
        expect(sut.organization.available).to.be.deep.equals(_.where(allOrgs, {manager:true}));
    });


    it('should return all organizations if managedOnly attribute is set but user is admin', function() {
        scope.managedOnly = 'managed-only';

        UserProvider.getUser = function(callback){
            callback({role: 'ADMIN'});
        }

        var sut = getSUT();
        scope.$digest();
        expect(sut.organization.selected).to.be.deep.equals(allOrgs[0]);
        expect(sut.organization.available).to.be.deep.equals(allOrgs);
    });
});
