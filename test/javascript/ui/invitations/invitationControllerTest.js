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
describe("Unit: InvitationSendController", function() {

    beforeEach(module('app'));

    var controller, scope, httpBackend, state;

    beforeEach(inject(function($injector){
        scope = $injector.get('$rootScope');
        controller = $injector.get('$controller')('InvitationSendController', {
            $scope: scope,
            NotificationService: {
                success: function(){},
                error: function(){}
            }
        });
        state = controller.state;

        httpBackend = $injector.get('$httpBackend');
    }));

    it('should not be null', function(){
        expect(controller).not.to.be.null;
    });

    it('default status is default', inject(function(){
        expect(state.value).to.be.equal(state.values.DEFAULT);
    }));

    it('send invitation status is sending', inject(function(){
        controller.sendInvitation();

        expect(state.value).to.be.equal(state.values.PENDING);
    }));

    it('invitation sent status success is sent', inject(function(){
        httpBackend.expectPOST('/rest/invitations')
            .respond({});

        controller.sendInvitation();
        httpBackend.flush();

        expect(state.value).to.be.equal(state.values.LOADED);
    }));

    it('invitation sent set details', inject(function(){
        httpBackend.expectPOST('/rest/invitations')
            .respond(500, {});

        controller.sendInvitation();
        httpBackend.flush();

        expect(state.value).to.be.equal(state.values.ERROR);
    }));
});
