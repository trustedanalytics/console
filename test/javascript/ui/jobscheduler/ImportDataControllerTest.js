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

describe("Unit: ImportDataController", function() {

    beforeEach(module('app'));

    var controller,
        scope,
        $state,
        importDataResource,
        notificationService,
        $q,
        jobFormConfig;

    beforeEach(inject(function ($controller, $rootScope, _$q_, State, JobFormConfig) {
        scope =  $rootScope.$new();
        $q = _$q_;
        jobFormConfig = JobFormConfig;

        notificationService = {
            error: sinon.stub().returns($q.defer().promise),
            success: sinon.stub().returns($q.defer().promise)
        };

        importDataResource = {
            withErrorMessage: function () {
                return this;
            },
            postJob: sinon.stub().returns($q.defer().promise),
            getConfiguration: sinon.stub().returns($q.defer().promise)
        };

        $state = {
            go: sinon.stub().returns($q.defer().promise)
        };

        getSUT($controller);
    }));

    function getSUT($controller) {
        return controller = $controller('ImportDataController', {
            $scope: scope,
            ImportDataResource: importDataResource,
            NotificationService: notificationService,
            $state: $state
        });
    }

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('should set state pending, load init data', function () {
        expect(scope.state.value).to.be.equal(scope.state.values.PENDING);
        expect(scope.importModel).not.to.be.null;
        expect(scope.config).not.to.be.null;
        expect(scope.importModes).not.to.be.null;
        expect(scope.frequencyUnits).not.to.be.null;
        expect(importDataResource.getConfiguration.called).to.be.true;
    });

    it('should get and set configuration data', inject(function($controller) {
        var sampleData = getSampleConfiguration();
        var jdbcUri = "jdbc:postgresql://";
        importDataResource.getConfiguration = sinon.spy(function() {
            var deferred = $q.defer();
            deferred.resolve(sampleData);
            return deferred.promise;
        });

        getSUT($controller);
        scope.$apply();

        expect(importDataResource.getConfiguration.called).to.be.true;
        expect(scope.databases).to.be.equal(sampleData.databases);
        expect(scope.config.databaseType).to.be.equal(sampleData.databases[0]);
        expect(scope.config.driver).to.be.equal(sampleData.databases[0].drivers[0]);
        expect(scope.importModel.sqoopImport.jdbcUri).to.be.equal(jdbcUri);
        expect(scope.timezones).to.be.equal(sampleData.timezones);
        expect(scope.config.dirPrefix).to.be.equal(sampleData.organizationDirectory);
        expect(scope.state.value).to.be.equal(scope.state.values.LOADED);
    }));

    it('should update jdbcUri', inject(function() {
        var expectedJdbcUri = "jdbc:driver://host:port/dbName";
        scope.config.driver = {
            name: "driver"
        };
        scope.config.host = "host";
        scope.config.port = "port";
        scope.config.dbName = "dbName";
        scope.$apply();

        scope.updateUri();

        expect(scope.importModel.sqoopImport.jdbcUri).to.be.equal(expectedJdbcUri);
    }));

    it('should update data base address', inject(function() {
        var form = {
            jdbcUri: {
                $viewValue: "jdbc:postgresql://209.208.78.54:5432/tt",
                $setValidity: sinon.stub().returns($q.defer().promise),
                $error: {
                    pattern: false
                }
            }
        };
        var sampleData = getSampleConfiguration();
        scope.databases = sampleData.databases;
        scope.$apply();

        scope.updateDbAddress(form);

        expect(scope.config.driver).to.be.equal(sampleData.databases[0].drivers[0]);
        expect(form.jdbcUri.$setValidity.calledWithExactly('invalidDriver', true)).to.be.true;
        expect(scope.config.host).to.be.equal("209.208.78.54");
        expect(scope.config.port).to.be.equal(5432);
        expect(scope.config.dbName).to.be.equal("tt");
    }));

    it('should set invalid driver error', inject(function() {
        var form = {
            jdbcUri: {
                $viewValue: "jdbc:nonexisting://209.208.78.54:5432/tt",
                $setValidity: sinon.stub().returns($q.defer().promise),
                $error: {
                    pattern: false
                }
            }
        };
        var sampleData = getSampleConfiguration();
        scope.databases = sampleData.databases;
        scope.$apply();

        scope.updateDbAddress(form);

        expect(scope.config.driver).to.be.equal(undefined);
        expect(form.jdbcUri.$setValidity.calledWithExactly('invalidDriver', false)).to.be.true;
        expect(scope.config.host).to.be.equal("209.208.78.54");
        expect(scope.config.port).to.be.equal(5432);
        expect(scope.config.dbName).to.be.equal("tt");
    }));

    it('should import data', inject(function($controller) {
        var startDate = "05/31/2016 12:00 AM";
        var endDate = "06/10/2016 12:00 AM";
        var coordinatorId = {
            id: "12345"
        };
        var coordinatorRoute = 'app.jobsscheduler.coordinatorjob';
        var expectedImportModel = jobFormConfig().importModel;
        expectedImportModel.schedule.start = startDate;
        expectedImportModel.schedule.end = endDate;
        importDataResource.postJob = sinon.spy(function() {
            var deferred = $q.defer();
            deferred.resolve(coordinatorId);
            return deferred.promise;
        });
        scope.importModel.schedule.start = startDate;
        scope.importModel.schedule.end = endDate;

        scope.submitImport();
        scope.$apply();

        expect(notificationService.error.called).to.be.equal(false);
        expect(importDataResource.postJob.calledWith(expectedImportModel)).to.be.equal(true);
        expect(notificationService.success.called).to.be.equal(true);
        expect($state.go.calledWithExactly(coordinatorRoute, { coordinatorjobId: coordinatorId.id })).to.be.equal.true;
    }));


    it('should not import because of invalid dates', function () {
        scope.importModel.schedule.start = "06/10/2016 12:00 AM";
        scope.importModel.schedule.end = "05/31/2016 2:00 AM";
        scope.$apply();

        scope.submitImport();

        expect(notificationService.error.called).to.be.true;
    });

    function getSampleConfiguration() {
        return {
            "databases": [{
                    "name": "PostgreSQL",
                    "drivers": [{
                            "name": "postgresql",
                            "version": "9.3",
                            "className": "org.postgresql.Driver"
                        }
                    ]
                }, {
                    "name": "MySQL",
                    "drivers": [{
                            "name": "mysql",
                            "version": "5.1",
                            "className": "org.mysql.Driver"
                        }
                    ]
                }
            ],
            "timezones": [
                "Etc/GMT",
                "Etc/UTC",
                "Europe/Warsaw",
                "GMT",
                "US/Central",
                "US/Pacific",
                "UTC"
            ],
            "organizationDirectory": "hdfs://nameservice1/org/cd83d26c-9b32-4e9e-be76-3246c252c3f4/user/f1f8edf2-f0f7-416f-aea9-bb851db6db85/"
        };
    }

});