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
describe("Unit: TargetUrlBuilder", function() {

    var targetProvider = {},
        sut;

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    beforeEach(inject(function(targetUrlBuilder, TestHelpers){
        sut = targetUrlBuilder;
        new TestHelpers().stubTargetProvider(targetProvider);

        targetProvider.organization = { guid: "1", name: "org" };
        targetProvider.space = { guid: "2", name: "space" };
    }));

    it('should not be null', inject(function(){
        expect(sut).not.to.be.null;
    }));

    it('get, no org or space given, return plain url', function(){
        var result = sut.get('///test//');

        expect(result).to.be.equals('/rest/test');
    });

    it('get, empty path given, return plain url', function(){
        var result = sut.get();

        expect(result).to.be.equals('/rest');
    });

    it('get, org given but no space given, return url with org', function(){
        var result = sut.useOrganization().get('test');

        expect(result).to.be.equals('/rest/organizations/1/test');
    });

    it('get, space given but no org given, return url with space', function(){
        var result = sut.useOrganization().get('test');

        expect(result).to.be.equals('/rest/organizations/1/test');
    });

    it('get, space given but no org given, return url with space', function(){
        var result = sut.useSpace().get('test');

        expect(result).to.be.equals('/rest/spaces/2/test');
    });

    it('get, org and space given, return url with org and space', function(){
        var result = sut.useOrganization().useSpace().get('test');

        expect(result).to.be.equals('/rest/organizations/1/spaces/2/test');
    });

    it('get, org and space given in reverse order, return url with org and space', function(){
        var result = sut.useSpace().useOrganization().get('test');

        expect(result).to.be.equals('/rest/organizations/1/spaces/2/test');
    });
});
