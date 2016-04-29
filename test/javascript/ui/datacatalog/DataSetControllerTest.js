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
describe("Unit: DataSetController", function() {

    beforeEach(module('app'));

    var controller,
        scope,
        rootScope,
        state,
        dataSetResource,
        notificationService,
        q,
        angularState,
        SAMPLE_DATASET = Object.freeze({
            id: "i1",
            orgUUID: ["o1", "o2"]
        }),
        ANOTHER_DATASET = Object.freeze({
            id: "i1",
            orgUUID: ["o1", "o2"]
        });

    beforeEach(inject(function($injector, State, $q, TestHelpers){
        rootScope = $injector.get('$rootScope');
        scope = rootScope.$new();
        q = $q;
        angularState = { go: function(){} };
        var targetProvider = new TestHelpers().stubTargetProvider();

        dataSetResource = {
            getById: function(){
                return $q.defer().promise;
            },
            success: function(){},
            withErrorMessage: function() {
                return this;
            }
        };

        notificationService = {
            confirm: function() {
                return $q.defer().promise;
            },
            success: function(){}
        };

        controller = $injector.get('$controller')('DataSetController', {
            $scope: scope,
            editableOptions: {},
            editableThemes: {
                bs3: {}
            },
            DataSetResource: dataSetResource,
            NotificationService: notificationService,
            $stateParams: { datasetId: SAMPLE_DATASET.id },
            $state: angularState,
            targetProvider: targetProvider
        });
        state = scope.state;
    }));

    it('should not be null', function(){
        expect(controller).not.to.be.null;
    });

    it('delete, show confirmation dialog', function(){
        var confirmSpied = sinon.spy(notificationService, 'confirm');

        scope.delete();

        expect(confirmSpied.called).to.be.true;
    });

    it('delete, confirmed, send delete request', function(){
        var confirmDeferred = mockConfirm();
        scope.dataSet = ANOTHER_DATASET;

        var called = false;
        dataSetResource.deleteById = function(id){
            expect(id).to.be.equal(SAMPLE_DATASET.id);
            called = true;
            return q.defer().promise;
        };

        scope.delete();
        confirmDeferred.resolve();
        scope.$apply();

        expect(called, "called").to.be.true;
        expect(state.value, "state").to.be.equal(state.values.PENDING);
    });

    it('delete, success, go to data catalog', function(){
        var confirmDeferred = mockConfirm();
        scope.dataSet = ANOTHER_DATASET;

        var deleteDeferred = q.defer();
        dataSetResource.deleteById = function(){
            return deleteDeferred.promise;
        };

        var goto = null;
        angularState.go = function(_goto){
            goto = _goto;
        };

        scope.delete();
        confirmDeferred.resolve();
        scope.$apply();
        deleteDeferred.resolve();
        scope.$apply();

        expect(goto).to.be.equal('app.datacatalog.datasets');
    });

    it('delete, error, show error msg', function(){
        var confirmDeferred = mockConfirm();
        scope.dataSet = ANOTHER_DATASET;

        var deleteDeferred = q.defer();
        dataSetResource.deleteById = function(){
            return deleteDeferred.promise;
        };

        scope.delete();
        confirmDeferred.resolve();
        scope.$apply();
        deleteDeferred.reject();
        scope.$apply();

        expect(state.value, "state").to.be.equal(state.values.LOADED);
    });


    function mockConfirm() {
        var confirmDeferred = q.defer();
        notificationService.confirm = function(){
            return confirmDeferred.promise;
        };
        return confirmDeferred;
    }


});
