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

describe("Unit: PendingInvitationsController", function() {

    var $controller,
        $q,
        $rootScope,
        scope,
        NotificationService,
        PendingInvitationsResource,
        ngTableParams;

    function getSUT() {
        return $controller('PendingInvitationsController', {
            $scope: scope,
            NotificationService: NotificationService,
            PendingInvitationsResource: PendingInvitationsResource,
            ngTableParams: ngTableParams
        });
    }


    beforeEach(module('app'));

    beforeEach(inject(function(_$controller_, _$rootScope_, _$q_, _NotificationService_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        scope = $rootScope.$new();
        NotificationService = _NotificationService_;

        var deferred = $q.defer();

        PendingInvitationsResource = {
            withErrorMessage: function() {
                return this;
            },
            getList: sinon.stub().returns(deferred.promise)

        };

        deferred.resolve(["user1", "user2"]);

        ngTableParams = function() {
            this.page = sinon.stub();
            this.reload = sinon.stub();
        };
    }));

    it('should initialize controller', function() {
        var controller = getSUT();
        expect(controller).not.to.be.null;
    });


    it('resend, when called should pass request to backend and show notification', function(){
        var deferred = $q.defer();
        PendingInvitationsResource.resend = sinon.stub().returns(deferred.promise);
        var controller = getSUT();
        var testMail = "eustachy@example.com";


        var successMessageSpy = sinon.spy(NotificationService, 'success');

        scope.resend(testMail);
        deferred.resolve();

        scope.$root.$digest();
        expect(PendingInvitationsResource.resend.withArgs(testMail).called).to.be.true;
        expect(successMessageSpy.called).to.be.true;

    });

    it('delete, when called should pass request to backend and reload list', function(){
        var deferred = $q.defer();
        PendingInvitationsResource.delete = sinon.stub().returns(deferred.promise);
        deferred.resolve();
        var controller = getSUT();
        var testMail = "eustachy@example.com";
        var successMessageSpy = sinon.spy(NotificationService, 'success');
        scope.delete(testMail);
        scope.$root.$digest();
        expect(PendingInvitationsResource.delete.withArgs(testMail).called).to.be.true;
        expect(successMessageSpy.called).to.be.true;
        expect(PendingInvitationsResource.getList.called).to.be.true;

    });


});
