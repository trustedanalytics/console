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

    App.controller('FromDatabaseController', function ($scope, State, JobFormConfig,
                                                                      FromDatabaseResource,
                                                                      NotificationService,
                                                                      $state, ImportHelper) {
        var state = new State().setPending();
        $scope.state = state;

        var getInitData = JobFormConfig;

        function loadInitialData() {
            $scope.importModel = getInitData();
            FromDatabaseResource
                .withErrorMessage('Could not get configuration data')
                .getConfiguration()
                .then(function onSuccess(config) {
                    $scope.databases = config.databases;
                    $scope.chooseDatabaseType($scope.databases[0]);
                    $scope.timezones = config.timezones;
                    $scope.importModel.dirPrefix = config.organizationDirectory;
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
            var valid = ImportHelper.validateDates($scope.importModel);
            if(valid) {
                $scope.state.setPending();
                var body = ImportHelper.preparePostImportBody($scope.importModel);
                FromDatabaseResource
                    .withErrorMessage('Creating workflow job failed')
                    .postJob(body)
                    .then(function onSuccess(coordinator) {
                        NotificationService.success('New workflow job has been created');
                        $state.go('app.jobsscheduler.coordinatorjob', { coordinatorjobId: coordinator.id });
                    })
                    .finally(function () {
                        $scope.state.setLoaded();
                    });
            } else {
                NotificationService.error('Invalid dates provided. Please provide end date that is after start date.');
            }
        };

        $scope.setTimezone = function (timezone) {
            $scope.importModel.schedulerConfig.timezone = timezone;
        };

        $scope.chooseDatabaseType = function (database) {
            $scope.importModel.databaseType = database;
            $scope.chooseDriver(database.drivers[0]);
        };

        $scope.chooseDriver = function (driver) {
            $scope.importModel.driver = driver;
            $scope.updateUri();
        };

        $scope.updateUri = function () {
            var jdbcUri = "jdbc:";
            jdbcUri = "jdbc:";
            jdbcUri += $scope.importModel.driver ? $scope.importModel.driver.name + "://" : '';
            jdbcUri += $scope.importModel.host ? $scope.importModel.host : '';
            jdbcUri += $scope.importModel.port ? ':' + $scope.importModel.port + "/" : '';
            jdbcUri += $scope.importModel.dbName ? $scope.importModel.dbName : '';
            $scope.importModel.jdbcUri = jdbcUri;
        };

        $scope.updateDbAddress = function (form) {
            var regExp = new RegExp($scope.jdbcUriPattern);
            if(!form.jdbcUri.$error.pattern && form.jdbcUri.$viewValue !== "") {
                var matches = regExp.exec(form.jdbcUri.$viewValue);
                $scope.importModel.driver = ImportHelper.findDriverByName($scope.databases, matches[1]);
                form.jdbcUri.$setValidity('invalidDriver', $scope.importModel.driver ? true : false);
                $scope.importModel.host = matches[2];
                $scope.importModel.port = Number(matches[3]);
                $scope.importModel.dbName = matches[4];
            }
        };
    });
}());