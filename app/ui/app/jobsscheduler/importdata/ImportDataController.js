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

    App.controller('ImportDataController', function ($scope,
                                                     State,
                                                     JobFormConfig,
                                                     ImportDataResource,
                                                     NotificationService,
                                                     $state,
                                                     ImportHelper) {
        var state = new State().setPending();
        $scope.state = state;

        var getInitData = JobFormConfig;
        var minimumFrequencyInSeconds;
        var regExpCheckDriver = new RegExp("jdbc:([\\w:]*[\\w])");

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
                    minimumFrequencyInSeconds = config.minimumFrequencyInSeconds;
                })
                .catch(function onError() {
                    $scope.state = state.setError();
                });
        }

        loadInitialData();

        $scope.submitImport = function () {
            if (!ImportHelper.validateDates($scope.importModel.schedule)) {
                NotificationService.error('Invalid dates provided. Please provide end date that is after start date.');
                return;
            }
            if (!ImportHelper.validateFrequency($scope.importModel.schedule, minimumFrequencyInSeconds)) {
                NotificationService.error('Invalid frequency provided. Please provide schedule period higher than ' +
                    minimumFrequencyInSeconds / 60 + ' minutes');
                return;
            }
            $scope.state.setPending();
            ImportDataResource
                .withErrorMessage('Creating workflow job failed')
                .postJob($scope.importModel)
                .then(function onSuccess(coordinator) {
                    NotificationService.success('New workflow job has been created');
                    $state.go('app.jobsscheduler.coordinatorjob', {coordinatorjobId: coordinator.id});
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
            $scope.config.jdbcUriPattern = driver.jdbcRegex;
            $scope.config.jdbcUriTemplate = driver.jdbcTemplate;
            $scope.updateUri();
        };

        $scope.updateUri = function () {
            var jdbcUri = $scope.config.jdbcUriTemplate;
            jdbcUri = jdbcUri.replace('{host}', $scope.config.host);
            jdbcUri = jdbcUri.replace('{port}', $scope.config.port);
            jdbcUri = jdbcUri.replace('{database}', $scope.config.dbName);
            $scope.importModel.sqoopImport.jdbcUri = jdbcUri;
        };

        $scope.updateDbAddress = function (form) {
            var matches = regExpCheckDriver.exec(form.jdbcUri.$viewValue);
            if (!matches) {
                form.jdbcUri.$setValidity('invalidDriver', true);
                return;
            }
            setDatabaseAndDriverByDriverName(matches[1], form);

            var regExp = new RegExp($scope.config.jdbcUriPattern);
            matches = regExp.exec(form.jdbcUri.$viewValue);
            if (matches) {
                var order = ImportHelper.getOrder($scope.config.jdbcUriTemplate);
                $scope.config.host = matches[order.indexOf('host') + 1];
                $scope.config.port = Number(matches[order.indexOf('port') + 1]);
                $scope.config.dbName = matches[order.indexOf('database') + 1];
            }
        };

        function setDatabaseAndDriverByDriverName(driverName, form) {
            var database;
            var driver;
            database = _.find($scope.databases, function (db) {
                driver = _.findWhere(db.drivers, {name: driverName});
                return driver != null;
            });
            if (database) {
                $scope.config.databaseType = database;
                $scope.config.driver = driver;
                $scope.config.jdbcUriPattern = driver.jdbcRegex;
                $scope.config.jdbcUriTemplate = driver.jdbcTemplate;
            }
            form.jdbcUri.$setValidity('invalidDriver', !!database);
        }
    });
}());