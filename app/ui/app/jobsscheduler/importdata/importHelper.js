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
    'use strict';

    App.factory('ImportHelper', function () {
        return {
            validateDates: validateDates,
            validateFrequency: validateFrequency,
            getOrder: getOrder,
            setDatabaseAndDriverByDriverName : setDatabaseAndDriverByDriverName
        };

        function validateDates(schedule) {
            return moment(schedule.end).diff(schedule.start) > 0;
        }

        function validateFrequency(schedule, minimumFrequencyInSeconds) {
            return moment.duration(schedule.frequency.amount, schedule.frequency.unit).asSeconds() >= minimumFrequencyInSeconds;
        }

        function getOrder(template) {
            var positions = {
                'host': template.indexOf("host"),
                'port': template.indexOf("port"),
                'database': template.indexOf("database")
            };
            return Object.keys(positions)
                .sort(function (a, b) {
                    return positions[a] - positions[b];
                });
        }

        function setDatabaseAndDriverByDriverName(driverName, form, $scope) {
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