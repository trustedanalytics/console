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

describe("Unit: FromDatabaseController", function() {

    beforeEach(module('app'));

    var controller, $state, scope, fromDatabaseResource, notificationService, $q;

    beforeEach(inject(function($controller, $rootScope, FromDatabaseResource, _$q_,
                               _$state_){
        scope = $rootScope.$new();
        $q = _$q_;
        $state = _$state_;

        notificationService = {
            error: function() {
                return $q.defer().promise;
            },
            success: function(){
                return $q.defer().promise;
            }
        };

        createController = function () {
            controller = $controller('FromDatabaseController', {
                $scope: scope,
                FromDatabaseResource: fromDatabaseResource,
                NotificationService: notificationService
            });
        };

        defer = $q.defer();

        fromDatabaseResource = {
            withErrorMessage: function() {
                return this;
            },
            postJob: sinon.stub().returns(defer.promise),
            getConfiguration: sinon.stub().returns(defer.promise)
        };

        scope.validateDates = function() {
            return true;
        };

    }));

    it('should not be null', function () {
        controller = createController();

        expect(controller).not.to.be.null;
    });

    it('should be not import because of invalid dates', function(){
        createController();
        var changedSpied = sinon.spy(notificationService, 'error');
        scope.importModel.schedulerConfig.end = "11/04/2016 12:00 AM";
        scope.importModel.schedulerConfig.start = "13/04/2016 12:00 AM";

        scope.submitImport();

        expect(changedSpied.called).to.be.true;
    });

});