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
describe("Unit: Testing filters", function() {

    beforeEach(module('app'));

    it('should have a ensureProtocol advancedsearch', inject(function($filter){
        expect($filter('ensureProtocol')).not.to.be.equal(null);
    }));

    it('ensureProtocol should add http to bare link', inject(function($filter){
        var sut = $filter('ensureProtocol');

        var result = sut("google.com");

        expect(result).to.be.equal("http://google.com");
    }));

    it('ensureProtocol should not add http if it already exists', inject(function($filter){
        var sut = $filter('ensureProtocol');

        var result = sut("http://google.com");

        expect(result).to.be.equal("http://google.com");
    }));

    it('ensureProtocol should not add http if https already exists', inject(function($filter){
        var sut = $filter('ensureProtocol');

        var result = sut("https://google.com");

        expect(result).to.be.equal("https://google.com");
    }));

    it('ensureProtocol should not add http if generic protocol already exists', inject(function($filter){
        var sut = $filter('ensureProtocol');

        var result = sut("//google.com");

        expect(result).to.be.equal("//google.com");
    }));

    it('ensureHttps should add https', inject(function($filter){
        var sut = $filter('ensureHttps');

        var result = sut("google.com");

        expect(result).to.be.equal("https://google.com");
    }));

    it('ensureHttps should change http to https', inject(function($filter){
        var sut = $filter('ensureHttps');

        var result = sut("http://google.com");

        expect(result).to.be.equal("https://google.com");
    }));
});
