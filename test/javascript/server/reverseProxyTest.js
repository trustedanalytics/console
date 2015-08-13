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
var path = require('path');
var proxyquire = require('proxyquire').noCallThru();
var sinon = require('sinon');
var chai = require('chai');

chai.config.includeStack = true;
var expect = chai.expect;

var srcPath = path.join(__dirname, '../../../app/server');

describe("Unit: reverse-proxy", function () {

    var sut,
        serviceMapping = [{
            path: "/some/path",
            name: "existingservice"
        }],
        config;

    beforeEach(function(){
        var getUserProvidedSerice = sinon.stub;
        getUserProvidedSerice.withArgs("existingservice").returns({
                name: 'existingservice',
                path: 'existingservice.host'
            });
        getUserProvidedSerice.returns(null);
        config = {
            getUserProvidedSerice: getUserProvidedSerice
        };

        sut = proxyquire(srcPath + '/reverse-proxy', {
            './config/config': config,
            './config/service-mapping': serviceMapping
        });
    });


});
