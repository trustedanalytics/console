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

    App.constant("JobFormConfig", function() {
        return {
            importModel: {
                "name" : "",
                "sqoopImport" : {
                    "jdbcUri" : "jdbc:",
                    "table" : "",
                    "username" : "",
                    "password" : "",
                    "targetDir" : "",
                    "importMode": "Append",
                    "checkColumn": "",
                    "lastValue": "",
                    "schema": ""
                },
                "schedule" : {
                    "zoneId" : "UTC",
                    "frequency" : {
                        "unit" : "Minutes",
                        "amount": ""
                    },
                    "start" : "",
                    "end" : ""
                }
            },
            config: {
                driver: {},
                databaseType: {
                    name: "",
                    drivers: {}
                },
                host: "",
                port: "",
                dbName: "",
                useDefaultDir: true,
                dirPrefix: ""
            },
            importModes: [
                {
                    name: "Append",
                    description: "Each import will fetch whole table into separate file.\nResults of previous imports will not be overwritten."
                }, {
                    name: "Overwrite",
                    description: "Each import will fetch whole table and overwrite results of previous import."
                }, {
                    name: "Incremental",
                    description: "Each import will fetch the difference from last import, and store it in separate file." +
                    " Sqoop will recognize the delta by value of specific column, so column name containing id must be specified." +
                    " We recommend using column which is auto-incremented. The initial value of column can be specified." +
                    "Use 0 to import whole table during first run."
                }
            ],
            frequencyUnits: [
                "minutes",
                "hours",
                "days",
                "months"
            ]
        };
    });
}());


