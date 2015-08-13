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
describe("Unit: UserAgent factory", function() {

    beforeEach(module('app'));

    it('should have a ensureProtocol advancedsearch', inject(function(userAgent){
        expect(userAgent).not.to.be.null;
    }));

    it('firefox on windows x64', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20130401 Firefox/31.0');
        var sut = $injector.get('userAgent');

        expect(sut.family, 'family').to.be.equals('windows');
        expect(sut.cpu.architecture).to.be.equals('amd64');
    }));

    it('firefox on windows x86', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0');
        var sut = $injector.get('userAgent');

        expect(sut.family, 'family').to.be.equals('windows');
        expect(sut.cpu.architecture).not.to.be.equals('amd64');
    }));

    it('chrome on windows x64', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36');
        var sut = $injector.get('userAgent');

        expect(sut.family, 'family').to.be.equals('windows');
        expect(sut.cpu.architecture).to.be.equals('amd64');
    }));

    it('chrome on windows x86', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36');
        var sut = $injector.get('userAgent');

        expect(sut.family, 'family').to.be.equals('windows');
        expect(sut.cpu.architecture).not.to.be.equals('amd64');
    }));

    it('firefox on OpenBSD x64', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (X11; OpenBSD amd64; rv:28.0) Gecko/20100101 Firefox/28.0');
        var sut = $injector.get('userAgent');
        expect(sut.family, 'family').to.be.equals('linux');
        expect(sut.cpu.architecture).to.be.equals('amd64');
        expect(sut.pkgFormat).not.to.be.ok;
    }));

    it('firefox on generic linux x64', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (X11; Linux x86_64; rv:28.0) Gecko/20100101 Firefox/28.0');
        var sut = $injector.get('userAgent');
        expect(sut.family, 'family').to.be.equals('linux');
        expect(sut.cpu.architecture).to.be.equals('amd64');
        expect(sut.pkgFormat).to.be.equals('deb');
    }));

    it('firefox on generic linux x86', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (X11; Linux i686; rv:21.0) Gecko/20100101 Firefox/21.0');
        var sut = $injector.get('userAgent');

        expect(sut.family, 'family').to.be.equals('linux');
        expect(sut.cpu.architecture).not.to.be.equals('amd64');
        expect(sut.pkgFormat).to.be.equals('deb');
    }));

    it('firefox on Ubuntu x64', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:24.0) Gecko/20100101 Firefox/24.0');
        var sut = $injector.get('userAgent');

        expect(sut.family, 'family').to.be.equals('linux');
        expect(sut.cpu.architecture).to.be.equals('amd64');
        expect(sut.pkgFormat).to.be.equals('deb');
    }));

    it('firefox on OS X', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:25.0) Gecko/20100101 Firefox/25.0');
        var sut = $injector.get('userAgent');

        expect(sut.family, 'osx').to.be.equals('osx');
        expect(sut.cpu.architecture).not.to.be.equals('amd64');
        expect(sut.pkgFormat).not.to.be.ok;
    }));

    it('chrome on ipad', inject(function($injector){
        $injector.get('uaParser').setUA('Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10');
        var sut = $injector.get('userAgent');

        expect(sut.family, 'osx').not.to.be.ok;
        expect(sut.cpu.architecture).not.to.be.equals('amd64');
        expect(sut.pkgFormat).not.to.be.ok;
    }));

});
