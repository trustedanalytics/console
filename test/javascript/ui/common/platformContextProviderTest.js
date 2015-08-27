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
describe("Unit: PlatformContextProvider", function() {

    var sut,
        cookies,
        platformContextResource,
        rootScope;

    var PLATFORM_CONTEXT_DEFAULT = Object.freeze({
        apiEndpoint: "http://api.example.com",
        plain: function() { return this; }
    });

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        cookies = {
            getObject: sinon.stub(),
            putObject: sinon.stub()
        };
        $provide.value('$cookies', cookies);

        platformContextResource = {
            getPlatformContext: sinon.stub(),
            withErrorMessage: function() { return this; }
        };
        $provide.value('PlatformContextResource', platformContextResource);
    }));

    beforeEach(inject(function(PlatformContextProvider, $rootScope){
        rootScope = $rootScope;
        sut = PlatformContextProvider;
    }));

    it('getPlatformContext, no cookie entry, query resource and return value', inject(function($q){
        cookies.getObject = sinon.stub().returns(undefined);

        platformContextResource.getPlatformContext = sinon.spy(function() {
            var deferred = $q.defer();
            deferred.resolve(PLATFORM_CONTEXT_DEFAULT);
            return deferred.promise;
        });

        var result = null;
        sut.getPlatformContext()
            .then(function(data){
                result = data;
            });
        rootScope.$apply();

        expect(platformContextResource.getPlatformContext).to.be.called;
        expect(result).to.be.equal(PLATFORM_CONTEXT_DEFAULT);
    }));

    it('getPlatformContext, exists in cookie, return value and do not query resource', inject(function($q){
        cookies.getObject = sinon.stub().returns(PLATFORM_CONTEXT_DEFAULT);

        var result = null;
        sut.getPlatformContext()
            .then(function(data){
                result = data;
            });
        rootScope.$apply();

        expect(platformContextResource.getPlatformContext).not.to.be.called;
        expect(result).to.be.equal(PLATFORM_CONTEXT_DEFAULT);
    }));

});
