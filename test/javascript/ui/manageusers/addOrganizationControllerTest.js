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
describe("Unit: AddOrganizationsController", function () {
    var $controller,
        $scope,
        state,
        OrganizationResource,
        NotificationService,
        $q,
        targetProvider;

    beforeEach(module('app'));

    beforeEach(inject(function(_$controller_, $rootScope, _$q_) {
        $controller = _$controller_;
        $scope = $rootScope.$new();
        OrganizationResource = {
            withErrorMessage: function() {
                return this;
            }
        };
        $q = _$q_;
        targetProvider = {};
        NotificationService = {
            error: sinon.stub(),
            success: sinon.stub()
        };
        state = {
            go: sinon.stub()
        };
    }));

    function getSUT() {
        $controller('AddOrganizationsController', {
            $scope: $scope,
            OrganizationResource: OrganizationResource,
            NotificationService: NotificationService,
            $state: state,
            targetProvider: targetProvider
        });
    }

    it('addOrganization when organization name already exists should prevent from submitting', function() {
        var deferred = $q.defer();
        OrganizationResource.getList = function() {
              return deferred.promise;
        };

        deferred.resolve([{
                name: 'abc1'
            },
            {
                name: 'abc2'
            }]);

        getSUT();
        $scope.$root.$digest();
        $scope.orgName = 'abc1';
        $scope.addOrganization();

        expect(NotificationService.error.calledWith('Organization "abc1" already exists')).to.be.true;
    });

    it('addOrganization when name is unique should submit organization', function() {
        var deferred = $q.defer();
        OrganizationResource.getList = function() {
            return deferred.promise;
        };

        var deferredRefresh = $q.defer();
        targetProvider.refresh = sinon.stub().returns(deferredRefresh.promise);
        deferredRefresh.resolve();

        deferred.resolve([{
                name: 'abc1'
            },
            {
                name: 'abc2'
            }]);

        getSUT();
        $scope.$root.$digest();

        $scope.orgName = 'abc3';

        deferred = $q.defer();
        OrganizationResource.createOrg = function() {
            return  deferred.promise;
        };

        $scope.addOrganization();
        deferred.resolve();
        $scope.$root.$digest();

        expect(NotificationService.success.called).to.be.true;
        expect(state.go.calledWith('app.manage.organizations.manage'));

    });
});
