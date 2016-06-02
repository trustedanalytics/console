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
(function () {
    "use strict";

    App.controller('ImportDataController', function ($scope, State, JobFormConfig,
                                                       ImportDataResource,
                                                       NotificationService,
                                                       $state, ImportHelper) {
        var state = new State().setPending();
        $scope.state = state;

        var getInitData = JobFormConfig;

        function loadInitialData() {
            $scope.importModel = getInitData().importModel;
            $scope.config = getInitData().config;
            $scope.importModes = getInitData().importModes;
            $scope.frequencyUnits = getInitData().frequencyUnits;
            ImportDataResource
                .withErrorMessage('Could not get configuration data')
                .getConfiguration()
                .then(function onSuccess(config) {
                    $scope.databases = config.databases;
                    $scope.chooseDatabaseType($scope.databases[0]);
                    $scope.timezones = config.timezones;
                    $scope.config.dirPrefix = config.organizationDirectory;
                    $scope.state = state.setLoaded();
                })
                .catch(function onError() {
                    $scope.state = state.setError();
                });
        }
        loadInitialData();

        /*
         catches pattern -> jdbc:driver://host:port/databaseName*
         */
        $scope.jdbcUriPattern = 'jdbc:([\\w]+)://([\\w._-]+|[[\\w:.]+]):([1-9][0-9]{0,4})/([\\w][\\w]*)';

        $scope.submitImport = function() {
            if(!ImportHelper.validateDates($scope.importModel)) {
                NotificationService.error('Invalid dates provided. Please provide end date that is after start date.');
                return;
            }
            $scope.state.setPending();
            ImportDataResource
                .withErrorMessage('Creating workflow job failed')
                .postJob($scope.importModel)
                .then(function onSuccess(coordinator) {
                    NotificationService.success('New workflow job has been created');
                    $state.go('app.jobsscheduler.coordinatorjob', { coordinatorjobId: coordinator.id });
                })
                .finally(function () {
                    $scope.state.setLoaded();
                });
        };

        $scope.setTimezone = function (timezone) {
            $scope.importModel.schedule.zoneId = timezone;
        };

        $scope.chooseDatabaseType = function (database) {
            $scope.config.databaseType = database;
            $scope.chooseDriver(database.drivers[0]);
        };

        $scope.chooseDriver = function (driver) {
            $scope.config.driver = driver;
            $scope.updateUri();
        };

        $scope.updateUri = function () {
            var jdbcUri = "jdbc:";
            jdbcUri = "jdbc:";
            jdbcUri += $scope.config.driver ? $scope.config.driver.name + "://" : '';
            jdbcUri += $scope.config.host ? $scope.config.host : '';
            jdbcUri += $scope.config.port ? ':' + $scope.config.port + "/" : '';
            jdbcUri += $scope.config.dbName ? $scope.config.dbName : '';
            $scope.importModel.sqoopImport.jdbcUri = jdbcUri;
        };

        $scope.updateDbAddress = function (form) {
            var regExp = new RegExp($scope.jdbcUriPattern);
            if(!form.jdbcUri.$error.pattern && form.jdbcUri.$viewValue) {
                var matches = regExp.exec(form.jdbcUri.$viewValue);
                $scope.config.driver = ImportHelper.findDriverByName($scope.databases, matches[1]);
                form.jdbcUri.$setValidity('invalidDriver', !!$scope.config.driver);
                $scope.config.host = matches[2];
                $scope.config.port = Number(matches[3]);
                $scope.config.dbName = matches[4];
            }
        };
    });
}());