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
describe("Unit: ManageOrganizationsController", function () {
    var scope;
    var state;
    var OrganizationResource;
    var $controller;
    var OrganizationsModalsService;
    var $q;
    var $rootScope;
    var SpaceResource;
    var notificationService;
    var targetProvider;
    var UserProvider;
    var currentUser;

    var orgs = [
        {
            guid: "2345",
            name: "org2",
            manager: true,
            spaces: [ {name:"space1"}, {name: "space2"}]
        },
        {
            guid: "1234",
            name: "org1",
            manager: false,
            spaces: [ { name: "space1" }, { name: "space2" } ]
        }
    ];

    beforeEach(module('app'));

    beforeEach(inject(function (State, _OrganizationResource_, _$controller_, _$q_, _$rootScope_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        OrganizationResource = _OrganizationResource_;
        SpaceResource = {
            withErrorMessage: function() {
                return this;
            }
        };
        state = {
            go: sinon.stub()
        };
        $controller = _$controller_;
        OrganizationsModalsService = sinon.stub();
        OrganizationsModalsService.supressGenericError = sinon.stub().returns(OrganizationsModalsService);
        $q = _$q_;
        targetProvider = {
            setOrganization: sinon.stub(),
            refresh: function () {
                return $q.defer().promise;
            }
        };
        notificationService = {
            error: sinon.stub(),
            success: sinon.stub()
        };

        currentUser = {
            "email": "email@email"
        };

        UserProvider = {
            getUser: sinon.stub().returns(currentUser)
        }
    }));

    function getSut() {
        return $controller('ManageOrganizationsController', {
            $scope: scope,
            OrganizationResource: OrganizationResource,
            $state: state,
            editableThemes: {
                bs3 : {}
            },
            editableOptions: sinon.stub(),
            OrganizationsModalsService: OrganizationsModalsService,
            targetProvider: targetProvider,
            NotificationService: notificationService,
            SpaceResource: SpaceResource,
            UserProvider: UserProvider
        });
    }

    function createAndInitSut() {
        var deferred = $q.defer();
        targetProvider.refresh = function () {
            return deferred.promise;
        };

        getSut();
        deferred.resolve(orgs);
        scope.$root.$digest();
    }


    it('should not be null', function () {
        var controller = getSut();
        expect(controller).not.to.be.null;
    });

    it('should load organizations on init', function() {
        createAndInitSut();
        expect(scope.state.isLoaded()).to.be.true;
        expect(scope.organizations.length).to.be.equals(1);
        expect(scope.current.guid).to.be.equals("2345");
    });

    it('should set current org for the proper one on showOrg function call', function() {
        createAndInitSut();
        scope.showOrg("2345");
        expect(scope.current.name).to.be.equals("org2");
    });

    it('should change target organization to current and redirect to action on button press', function() {
        createAndInitSut();
        scope.redirectTo('test.state');
        expect(targetProvider.setOrganization.withArgs(orgs[0]).called).to.be.true;
        expect(state.go.withArgs('test.state').called).to.be.true;
    });

    it('should show dialog on successful organization deletion', function() {
        OrganizationsModalsService.onDeleteSuccess = sinon.stub();

        OrganizationsModalsService.deleteOrganization = function() {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        };

        OrganizationResource.deleteOrg = function() {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        };

        createAndInitSut();
        targetProvider.refresh = sinon.spy(targetProvider, 'refresh');
        scope.deleteOrganization();
        scope.$root.$digest();
        expect(OrganizationsModalsService.onDeleteSuccess.called).to.be.true;
        expect(targetProvider.refresh.called).to.be.true;
    });

    it('should show error dialog on unsuccessful organization deletion', function() {
        OrganizationsModalsService.onDeleteError = sinon.stub();

        OrganizationsModalsService.deleteOrganization = function() {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        };


        OrganizationResource.deleteOrg = function() {
            var deferred = $q.defer();
            deferred.reject();
            return deferred.promise;
        };
        createAndInitSut();
        scope.deleteOrganization();
        scope.$root.$digest();
        expect(OrganizationsModalsService.onDeleteError.called).to.be.true;
        expect(scope.state.isLoaded()).to.be.true;
    });

    it('should show dialog on successful organization name update', function() {
        OrganizationsModalsService.onUpdateSuccess = sinon.stub();

        OrganizationResource.updateName = function() {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        };

        var testName = 'testName';

        createAndInitSut();
        scope.updateName(testName);
        scope.$root.$digest();
        expect(OrganizationsModalsService.onUpdateSuccess.called).to.be.true;
    });

    it('addSpace when space name is unique should send request', function() {
        var postDeferred = $q.defer();
        SpaceResource.createSpace = sinon.stub().returns(postDeferred.promise);
        postDeferred.resolve();

        createAndInitSut();
        targetProvider.refresh = sinon.spy(targetProvider, 'refresh');

        scope.spaceName = 'test-space';
        scope.addSpace();

        $rootScope.$digest();

        expect(notificationService.success.called).to.be.true;
        expect(SpaceResource.createSpace.called).to.be.true;
        expect(targetProvider.refresh.called).to.be.true;
        expect(scope.spaceName).to.be.equals('');
    });

    it('addSpace when space name is not unique should show error', function() {
        var postDeferred = $q.defer();
        SpaceResource.createSpace = sinon.stub().returns(postDeferred.promise);
        postDeferred.resolve();

        var refreshDeferred = $q.defer();
        targetProvider.refresh = sinon.stub().returns(refreshDeferred.promise);
        refreshDeferred.resolve();

        createAndInitSut();
        scope.spaceName = 'space2';
        scope.addSpace();

        $rootScope.$digest();

        expect(notificationService.error.called).to.be.true;
        expect(SpaceResource.createSpace.called).to.be.false;
    });

    it('deleteSpace should send DELETE request', function() {
        var deleteDeferred = $q.defer();
        SpaceResource.removeSpace = sinon.stub().returns(deleteDeferred.promise);
        deleteDeferred.resolve();

        var refreshDeferred = $q.defer();
        targetProvider.refresh = sinon.stub().returns(refreshDeferred.promise);
        refreshDeferred.resolve();

        var notificationDeferred = $q.defer();
        notificationService.confirm = sinon.stub().returns(notificationDeferred.promise);
        notificationDeferred.resolve();

        createAndInitSut();
        targetProvider.refresh = sinon.spy(targetProvider, 'refresh');
        scope.deleteSpace({guid: '1234'});

        $rootScope.$digest();

        expect(notificationService.success.called).to.be.true;
        expect(SpaceResource.removeSpace.called).to.be.true;
        expect(targetProvider.refresh.called).to.be.true;
    });

    it('should sort list of organizations', function() {
        createAndInitSut();

        var isSortedByName = function(organizationsList) {
            for (var i = 0; i < organizationsList.length - 1; ++i) {
                if (organizationsList[i].name.localeCompare(organizationsList[i + 1].name) > 0) {
                    return false;
                }
            }
            return true;
        };

        expect(isSortedByName(scope.organizations)).to.be.true;
    });
});
