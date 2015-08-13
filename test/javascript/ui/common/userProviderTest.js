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
// jshint ignore: start
describe("Unit: UserProvider", function() {

    var USER = Object.freeze({
            id: "sth"
        }),
        injector,
        getSut = function(){
            return injector.get('UserProvider');
        };

    beforeEach(module('app'));

    beforeEach(inject(function($injector){
        injector = $injector;
    }));

    it('should have a UserProvider', inject(function(){
        expect(getSut()).not.to.be.null;
    }));

    it('getUser should call rest and return user', inject(function($httpBackend){
        $httpBackend.expectGET('/rest/users/current').respond(USER);
        var sut = getSut();

        var result;
        sut.getUser(function(user){
            result = user;
        });
        $httpBackend.flush();

        expect(result.id).to.equals(USER.id);
    }));


    it('getUser second time do not call rest twice', inject(function($httpBackend){
        $httpBackend.expectGET('/rest/users/current').respond(USER);
        var sut = getSut();

        sut.getUser(function(){});
        $httpBackend.flush();
        sut.getUser(function(){});
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('getUser twice at once do not call rest twice', inject(function($httpBackend){
        $httpBackend.expectGET('/rest/users/current').respond(USER);
        var sut = getSut();

        sut.getUser(function(){});
        sut.getUser(function(){});
        $httpBackend.flush();
    }));

});
// jshint ignore: end
