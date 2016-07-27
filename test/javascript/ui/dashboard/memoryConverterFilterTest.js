/**
 * Copyright (c) 2016 Intel Corporation
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
/* jshint -W030 */
describe("Unit: MemoryConverterFilter", function () {

    var sut;

    beforeEach(module('app'));

    beforeEach(inject(function ($filter) {
        sut = $filter('memoryConverter');
    }));

    it('should not be null', function () {
        expect(sut).not.to.be.null;
    });

    it('empty source and destination unit, return the same value', function () {
        var result = sut(1234);

        expect(result).to.be.equal(1234);
    });

    it('incorrect source unit, throw error', function () {
        var fn = _.partial(sut, 1234, 'KB', 'bla');

        expect(fn).to.throw('Incorrect value of source or destination units BLA KB');
    });

    it('incorrect destination unit, throw error', function () {
        var fn = _.partial(sut, 1234, 'bla', 'KB');

        expect(fn).to.throw('Incorrect value of source or destination units KB BLA');
    });

    it('bytes to KB conversion, 2048 given, should return 2', function () {
        var result = sut(2048, 'KB', 'B');

        expect(result).to.be.equal(2);
    });

    it('KB to GB conversion, 10234567 given, should return a fraction', function () {
        var result = sut(1234567, 'GB', 'KB');

        expect(result.toFixed(5)).to.be.equal('1.17737');
    });

    it('empty source unit, assume bytes', function () {
        var result = sut(2048, 'KB');

        expect(result).to.be.equal(2);
    });
});
