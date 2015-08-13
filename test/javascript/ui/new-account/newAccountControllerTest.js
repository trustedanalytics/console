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
describe("Unit: NewAccountController", function() {

    beforeEach(module('newAccountApp'));

    var controller, scope, createController, location, httpBackend,
        VALID_CODE = 'qwe',
        INVITATIONS_URL = '/rest/registrations',
        VALID_URL = INVITATIONS_URL + '/' + VALID_CODE;


    var prepareCodeCorrect = function() {
        location.search = function() {
            return { code: VALID_CODE };
        };
        httpBackend.expectGET(VALID_URL).respond({});
        createController();
    };

    beforeEach(inject(function($controller, $rootScope, $location, $httpBackend){
        scope = $rootScope;
        location = $location;
        httpBackend = $httpBackend;
        createController = function() {
            return $controller('newAccountController', {
                $scope: scope
            });
        };
        controller = createController();
    }));

    it('should not be null', function(){
        expect(controller).not.to.be.null;
    });

    it('no code given set status error', function(){
        location.search = function() {
            return {};
        };

        expect(scope.status).to.be.equal(scope.statuses.INCORRECT_CODE);
    });

    it('empty code given set status error', function(){
        location.search = function() {
            return { code : '' };
        };

        expect(scope.status).to.be.equal(scope.statuses.INCORRECT_CODE);
    });

    it('invitation exists set status default', function(){
        location.search = function() {
            return { code : VALID_CODE };
        };
        httpBackend.expectGET(VALID_URL).respond({});

        createController();
        httpBackend.flush();

        expect(scope.status).to.be.equal(scope.statuses.DEFAULT);
    });

    it('invitation does not exist set status incorrect code', function(){
        location.search = function() {
            return { code : VALID_CODE };
        };
        httpBackend.expectGET(VALID_URL).respond(404, {});

        createController();
        httpBackend.flush();

        expect(scope.status).to.be.equal(scope.statuses.INCORRECT_CODE);
    });

    it('invitation fetch failed set status error', function(){
        location.search = function() {
            return { code : VALID_CODE };
        };
        httpBackend.expectGET(VALID_URL).respond(500, {});

        createController();
        httpBackend.flush();

        expect(scope.status).to.be.equal(scope.statuses.ERROR);
    });

    it('password length validator null password given return true', function(){
        prepareCodeCorrect();
        scope.user = {};

        expect(scope.validators.passwordLength()).to.be.true;
    });

    it('password length validator empty password given return true', function(){
        prepareCodeCorrect();
        scope.user = {
            password: ""
        };

        expect(scope.validators.passwordLength()).to.be.true;
    });

    it('password length validator length 5 given return false', function(){
        prepareCodeCorrect();
        scope.user = {
            password: '12345'
        };

        expect(scope.validators.passwordLength()).to.be.false;
    });

    it('password length validator length 6 given return true', function(){
        prepareCodeCorrect();
        scope.user = {
            password: '123456'
        };

        expect(scope.validators.passwordLength()).to.be.true;
    });

    it('password match validator main password null given return true', function(){
        prepareCodeCorrect();
        scope.user = {};

        expect(scope.validators.passwordMatch()).to.be.true;
    });

    it('password match validator main password empty given return true', function(){
        prepareCodeCorrect();
        scope.user = {
            password: ''
        };

        expect(scope.validators.passwordMatch()).to.be.true;
    });

    it('password match validator secondary password null given return true', function(){
        prepareCodeCorrect();
        scope.user = {
            password: '123123'
        };

        expect(scope.validators.passwordMatch()).to.be.true;
    });

    it('password match validator secondary password empty given return true', function(){
        prepareCodeCorrect();
        scope.user = {
            password: '123123',
            passwordRepetition: ''
        };

        expect(scope.validators.passwordMatch()).to.be.true;
    });

    it('password match validator passwords do not match return false', function(){
        prepareCodeCorrect();
        scope.user = {
            password: '123456',
            passwordRepetition: 'asdasd'
        };

        expect(scope.validators.passwordMatch()).to.be.false;
    });

    it('password match validator passwords match return true', function(){
        prepareCodeCorrect();
        scope.user = {
            password: '123456',
            passwordRepetition: '123456'
        };

        expect(scope.validators.passwordMatch()).to.be.true;
    });

    it('createUser set status processing', function(){
        prepareCodeCorrect();
        scope.user = {};

        scope.createUser();

        expect(scope.status).to.be.equal(scope.statuses.PROCESSING);
    });

    it('createUser success set status created', function(){
        prepareCodeCorrect();
        scope.user = {};
        httpBackend.expectPOST('/rest/registrations?code='+VALID_CODE).respond({});

        scope.createUser();
        httpBackend.flush();

        expect(scope.status).to.be.equal(scope.statuses.CREATED);
    });

    it('createUser conflict set status error', function(){
        prepareCodeCorrect();
        scope.user = {};
        httpBackend.expectPOST('/rest/registrations?code='+VALID_CODE).respond(409, {});

        scope.createUser();
        httpBackend.flush();

        expect(scope.status).to.be.equal(scope.statuses.ERROR);
    });

    it('createUser other error set status error', function(){
        prepareCodeCorrect();
        scope.user = {};
        httpBackend.when('POST', '/rest/registrations?code='+VALID_CODE).respond(500, {});

        scope.createUser();
        httpBackend.flush();

        expect(scope.status).to.be.equal(scope.statuses.ERROR);
    });
});
