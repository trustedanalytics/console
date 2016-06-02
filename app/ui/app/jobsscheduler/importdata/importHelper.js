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

(function() {
    'use strict';

    App.factory('ImportHelper', function () {

        return {
            findDriverByName: findDriverByName,
            validateDates: validateDates,
            preparePostImportBody: preparePostImportBody
        };

        function findDriverByName(databases, driverName) {
            var result = null;
            _.find(databases, function (db) {
                result = _.find(db.drivers, function (driver) {
                    return driver.name === driverName;
                });
                return result != null;
            });
            return result;
        }

        function validateDates(importModel) {
            var diff = moment(importModel.schedule.end).diff(importModel.schedule.start);
            return diff > 0;
        }

        function preparePostImportBody(importModel) {
            return {
                "name": importModel.name,
                "sqoopImport": {
                    "jdbcUri": importModel.jdbcUri,
                    "table": importModel.table,
                    "username": importModel.username,
                    "password": importModel.password,
                    "targetDir": importModel.targetDir,
                    "importMode": importModel.mode,
                    "checkColumn": importModel.columnName,
                    "lastValue": importModel.incrementalValue,
                    "schema": importModel.schema
                },
                "schedule": {
                    "zoneId": importModel.schedulerConfig.timezone,
                    "frequency": {
                        "unit": importModel.schedulerConfig.frequency.unit.toLowerCase(),
                        "amount": importModel.schedulerConfig.frequency.amount
                    },
                    "start": importModel.schedulerConfig.start,
                    "end": importModel.schedulerConfig.end
                }
            };
        }
    });
}());