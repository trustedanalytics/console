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
describe("Unit: DataSetTransferListControllerTest", function() {

    beforeEach(module('app'));

    var $rootScope,
        $controller,
        scope,
        state,
        DasResource,
        $q;

    var SAMPLE_DATA = [{
        "id" : "65e7f379-868b-4fa6-b64e-2f90d194e95a",
        "userId" : 0,
        "source" : "https://www.quandl.com/api/v1/datasets/WORLDBANK/CHN_NY_GDP_MKTP_KD_ZG.csv",
        "state" : "FINISHED",
        "idInObjectStore" : "b2a9d6eb-5c0d-4429-b754-597041624fea",
        "category" : "climate",
        "title" : "After DAS bugfix",
        "timestamps" : {
            "NEW" : 1428933918,
            "DOWNLOADED" : 1428933919,
            "FINISHED" : 1428933920
        },
        "orgUUID" : "a1bbc261-262e-484b-81d6-8c0751cf2876"
    }, {
        "id" : "8dd63d6c-6b30-48a5-aec3-54a4bfd4cf87",
        "userId" : 0,
        "source" : "http://fake-csv-server.apps.example.com/fake-csv/1",
        "state" : "FINISHED",
        "idInObjectStore" : "77410212-1517-43a6-b345-e1908354697a",
        "category" : "other",
        "title" : "Newer API test",
        "timestamps" : {
            "NEW" : 1428582447,
            "DOWNLOADED" : 1428582447,
            "FINISHED" : 1428582448
        },
        "orgUUID" : "a1bbc261-262e-484b-81d6-8c0751cf2876"
    }
    ];

    var paramsStub = Object.freeze({
        sorting: function(){},
        filter: function(){},
        total: function(){},
        page: function(){},
        count: function(){}
    });


    beforeEach(inject(function(_$rootScope_, State, _$controller_, _$q_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        state = new State();
        DasResource = sinon.stub();
        DasResource.withErrorMessage = sinon.stub().returns(DasResource);
        $controller = _$controller_;
        $q = _$q_;
    }));

    function getSUT() {
        return $controller('DataSetTransferListController', {
            $scope: scope,
            $rootScope: $rootScope,
            state: state,
            DasResource: DasResource
        });
    }

    it('should find max timestamp', function() {
        var controller = getSUT();
        var result = controller.lastTimestamp({
            'NEW': 10,
            'DOWNLOAD': 15,
            'FINISHED': 40
        });
        expect({state: 'FINISHED', time: 40}).to.be.deep.equal(result);
    });

    it('getData, empty queue, download queue', function() {
        var controller = getSUT();

        DasResource.getTransfers = function() {
            return $q.defer().promise;
        };
        var getTransfersSpied = sinon.spy(DasResource, 'getTransfers');

        controller.getData($q.defer(), paramsStub);

        expect(scope.state.value).to.be.equal(state.values.PENDING);
        expect(getTransfersSpied.called).to.be.true;
    });

    it('getData, download success, set queue', function() {
        var controller = getSUT();
        var getTransfersDeferred = $q.defer();

        DasResource.getTransfers = function() {
            return getTransfersDeferred.promise;
        };

        controller.getData($q.defer(), paramsStub);
        getTransfersDeferred.resolve(SAMPLE_DATA);
        scope.$apply();

        expect(scope.state.value).to.be.equal(state.values.LOADED);
        expect(scope.downloadQueue).to.deep.equal(SAMPLE_DATA);
    });

    it('getData, download error, show error', function() {
        var controller = getSUT();
        var getTransfersDeferred = $q.defer();

        DasResource.getTransfers = function() {
            return getTransfersDeferred.promise;
        };

        controller.getData($q.defer(), paramsStub);
        getTransfersDeferred.reject();
        scope.$apply();

        expect(scope.state.value).to.be.equal(state.values.ERROR);
    });

    it('getData, non empty queue, use existing data', function() {
        var controller = getSUT();
        scope.downloadQueue = SAMPLE_DATA;

        DasResource.getTransfers = function() {
            return $q.defer().promise;
        };
        var getTransfersSpied = sinon.spy(DasResource, 'getTransfers');

        controller.getData($q.defer(), paramsStub);

        expect(scope.state.value).to.be.equal(state.values.LOADED);
        expect(getTransfersSpied.called).to.be.false;
        expect(scope.downloadQueue).to.deep.equal(SAMPLE_DATA);
    });

    it('reload, non empty queue, download again', function() {
        getSUT();
        scope.downloadQueue = SAMPLE_DATA;

        DasResource.getTransfers = function() {
            return $q.defer().promise;
        };
        var getTransfersSpied = sinon.spy(DasResource, 'getTransfers');

        scope.reload();

        expect(scope.state.value).to.be.equal(state.values.PENDING);
        expect(getTransfersSpied.called).to.be.true;
    });

    it('lastTimestamp, given timestamp-state pairs, the object with latest stae is found', function() {
        var controller = getSUT();
        var testTimestamps = {
            "DOWNLOADED" : 1440504890,
            "ERROR" : 1440505096,
            "VALIDATED" : 1440504890,
            "NEW" : 1440504890
        }

        var maxPairs = controller.lastTimestamp(testTimestamps);
        expect(maxPairs.state).to.be.equal("ERROR");
        expect(maxPairs.time).to.be.equal(1440505096);
    });


});
