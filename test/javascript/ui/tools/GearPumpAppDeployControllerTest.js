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
describe("Unit: GearPumpAppDeployController", function () {

    var controller,
        createController,
        rootScope,
        scope,
        httpBackend,
        locationMock,
        _targetProvider,
        fileUploaderServiceMock,
        state,
        serviceInstancesMapperMock,
        notificationService,
        gearPumpAppDeployResource,
        toolsInstanceResourceMock,
        serviceKeysResourceMock,
        serviceInstancesResourceMock,
        $q,
        organization = { guid: 111, name: "org" },
        space = { guid: 222, name: "space"},
        INSTANCE_NAME = 'someInstance',
        INSTANCE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        SOME_GUID =   'cccccccc-cccc-cccc-cccc-cccccccccccc',
        SERVICE_LABEL = 'kafka',
        SERVICE_INSTANCES_SUMMARY = [{
            "guid": INSTANCE_ID,
            "label": SERVICE_LABEL,
            "instances": [{
                "guid": INSTANCE_ID,
                "name": 'someName',
                "service": SOME_GUID,
                "service_plan": {
                    "name": "Simple",
                    "service": {
                        "guid": SOME_GUID,
                        "label": "label"
                    }
                },
                "service_keys": [{
                    "guid": SOME_GUID,
                    "name": "gp-app-creds--100",
                    "service_instance_guid": INSTANCE_ID,
                    "credentials": {
                        "uri": "someData"
                    }
                }]
            }]
        },
        {
            "guid": '11',
            "label": 'otherLabel',
            "instances": [{
                "guid": '23',
                "name": 'someName',
                "service": '44',
                "service_plan": {
                    "name": "Simple",
                    "service": {
                        "guid": '66',
                        "label": "someLabel"
                    }
                },
                "service_keys": [{
                    "guid": '66',
                    "name": "gp-app-creds-sdadsadsa-22",
                    "service_instance_guid": '99',
                    "credentials": {
                        "uri": "someData"
                    }
                }]
            }]
        }],
        GEARPUMP_INSTANCE_DATA = {
            plain: function () {
                return {
                    "test-3": {
                        "guid": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                        "hostname": "gearpump-ui-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa-aaaaaaaa.domain.com",
                        "login": "login",
                        "password": "password"
                    }
                };
            }
        },
        EXAMPLE_FORM = {
            jarFile: 'someName',
            configFile: 'someConfName',
            appResultantArguments: 'args',
            usersArguments: 'uArgs',
            instances: {
                someInstance: 'someName'
            }
        };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $location, TestHelpers, $rootScope, _$q_, Restangular,
                                ServiceInstancesResource, ServiceInstancesMapper, ServiceKeysResource, State,
                                _$httpBackend_, NotificationService, GearPumpAppDeployResource) {

        _targetProvider = new TestHelpers().stubTargetProvider();
        state = new State();
        $q = _$q_;
        httpBackend = _$httpBackend_;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.instancesState = new State();

        _targetProvider.organization = organization;
        _targetProvider.space = space;

        toolsInstanceResourceMock = {
            getToolsInstances: function () {
                return resolvedPromise( GEARPUMP_INSTANCE_DATA );
            }
        };

        serviceInstancesResourceMock = Restangular.service("service_instances");
        serviceInstancesResourceMock.getSummary = function() {
            return resolvedPromise( SERVICE_INSTANCES_SUMMARY );
        };

        serviceInstancesMapperMock = ServiceInstancesMapper;
        serviceKeysResourceMock = ServiceKeysResource;
        notificationService = NotificationService;
        gearPumpAppDeployResource = GearPumpAppDeployResource;
        locationMock = $location;
        fileUploaderServiceMock = {};

        createController = function() {
            controller = $controller('GearPumpAppDeployController', {
                $routeParams: { instanceId: INSTANCE_NAME },
                $scope: scope,
                $location: locationMock,
                targetProvider: _targetProvider,
                FileUploaderService: fileUploaderServiceMock,
                NotificationService: notificationService,
                ServiceInstancesMapper: serviceInstancesMapperMock,
                ServiceKeysResource: serviceKeysResourceMock,
                ToolsInstanceResource: toolsInstanceResourceMock,
                ServiceInstancesResource: serviceInstancesResourceMock,
                GearPumpAppDeployResource: gearPumpAppDeployResource,
                $state: state
            });
        };

        createController();
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('instanceCheckboxChange, checked success, get service\'s data and set in scope', function () {

        scope.uploadFormData = { instances: {} };
        scope.uploadFormData.instances[INSTANCE_ID] = 'someData';

        scope.setAppArguments = sinon.stub().returns(resolvedPromise());

        scope.instanceCheckboxChange(INSTANCE_ID, SERVICE_LABEL, INSTANCE_NAME);
        rootScope.$digest();

        expect(scope.setAppArguments).to.be.called;
        expect(scope.instancesState.value).to.be.equal(state.values.LOADED);
        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={}');

    });

    it('instanceCheckboxChange, unchecked, unset instance\'s data in scope', function () {

        scope.uploadFormData = { instances: {} };

        scope.setAppArguments = sinon.stub().returns(resolvedPromise());

        scope.instanceCheckboxChange(INSTANCE_ID, SERVICE_LABEL, INSTANCE_NAME);
        rootScope.$digest();

        expect(scope.setAppArguments.called).to.be.false;
        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={}');

    });

    it('instanceCheckboxChange, checked error, error while getting data', function () {

        scope.uploadFormData = { instances: {} };
        scope.uploadFormData.instances[INSTANCE_ID] = 'someData';

        scope.setAppArguments = sinon.stub().returns(rejectedPromise());

        scope.instanceCheckboxChange(INSTANCE_ID, SERVICE_LABEL, INSTANCE_NAME);
        rootScope.$digest();

        expect(scope.setAppArguments).to.be.called;
        expect(scope.instancesState.value).to.be.equal(state.values.LOADED);
        expect(scope.uploadFormData.instances[INSTANCE_ID]).to.be.false;

    });

    it('setAppArguments, success, create service key get data and delete key', function () {

        sinon.stub(Math, "random", function(){
            return 1;
        });

        serviceKeysResourceMock.addKey = sinon.stub().returns(resolvedPromise());
        serviceKeysResourceMock.deleteKey = sinon.stub().returns(resolvedPromise());
        serviceInstancesResourceMock.getSummary = sinon.stub().returns(resolvedPromise(SERVICE_INSTANCES_SUMMARY));

        scope.setAppArguments(INSTANCE_ID, SERVICE_LABEL);
        rootScope.$digest();

        expect(serviceKeysResourceMock.addKey).to.be.called;
        expect(serviceInstancesResourceMock.getSummary).to.be.called;
        expect(scope.services).to.be.deep.equal([ SERVICE_INSTANCES_SUMMARY[0] ]);

    });

    it('usersArgumentsChange, add first element, create app resultant arguments', function () {

        scope.uploadFormData = { appResultantArguments: {} };

        scope.usersParameters = [{ key: 'someKey', value: 'someValue' }];
        scope.usersArgumentsChange();
        rootScope.$digest();

        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={"usersArgs":{"someKey":"someValue"}}');

    });

    it('usersArgumentsChange, add twice, create app resultant arguments', function () {

        scope.uploadFormData = { appResultantArguments: {} };

        scope.usersParameters = [{ key: 'someKey', value: 'someValue' }];
        scope.usersArgumentsChange();
        rootScope.$digest();

        scope.usersParameters = [{ key: 'someKey2', value: 'someValue2' }];
        scope.usersArgumentsChange();
        rootScope.$digest();

        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={"usersArgs":{"someKey2":"someValue2"}}');

    });

    it('usersArgumentsChange, add and remove, create app resultant arguments', function () {

        scope.uploadFormData = { appResultantArguments: {} };

        scope.usersParameters = [{ key: 'someKey', value: 'someValue' }];
        scope.usersArgumentsChange();
        rootScope.$digest();

        scope.usersParameters = [];
        scope.usersArgumentsChange();
        rootScope.$digest();

        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={}');

    });

    it('deployGPApp, success, deploy application on Apache Gearpump', function () {

        httpBackend.whenPOST('/rest/gearpump/instanceName/login').respond();

        scope.uiInstanceName = 'instanceName';
        scope.gpUiData = {
            login: 'login',
            password: 'pass'
        };

        gearPumpAppDeployResource.getGPToken = sinon.stub().returns(resolvedPromise());
        notificationService.progress = sinon.stub().returns(resolvedPromise());
        fileUploaderServiceMock.uploadFiles = sinon.stub().returns(resolvedPromise({
            data: 'great',
            status: 200,
            loaded: 100
        }));

        scope.deployGPApp();
        rootScope.$digest();

        expect(fileUploaderServiceMock.uploadFiles).to.be.called;
        expect(notificationService.progress).to.be.called;
        expect(scope.state.value).to.be.equal(state.values.LOADED);

    });

    it('deployGPApp, upload error, deploy application on Apache Gearpump', function () {

        scope.uiInstanceName = 'instanceName';
        scope.gpUiData = {
            login: 'login',
            password: 'pass'
        };

        gearPumpAppDeployResource.getGPToken = sinon.stub().returns(resolvedPromise());
        notificationService.progress = sinon.stub().returns(resolvedPromise());
        fileUploaderServiceMock.uploadFiles = sinon.stub().returns(rejectedPromise({
            status: 404
        }));

        scope.deployGPApp();
        rootScope.$digest();

        expect(fileUploaderServiceMock.uploadFiles).to.be.called;
        expect(notificationService.progress).to.be.called;
        expect(scope.state.value).to.be.equal(state.values.LOADED);

    });

    it('clearForm, clear form, clear form input fields', function () {

        scope.uploadFormData = EXAMPLE_FORM;
        scope.usersParameters = [ { key: null, value: null } ];

        scope.clearForm();
        rootScope.$digest();

        expect(scope.uploadFormData.jarFile).to.be.equal('');
        expect(scope.uploadFormData.configFile).to.be.equal('');
        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={}');
        expect(scope.uploadFormData.usersArguments).to.be.equal('');
        expect(scope.usersParameters).to.be.deep.equal([]);
        expect(scope.uploadFormData.instances).to.be.deep.equal({});

    });

    function resolvedPromise(params) {
        var deferred = $q.defer();
        deferred.resolve(params);
        return deferred.promise;
    }

    function rejectedPromise(params) {
        var deferred = $q.defer();
        deferred.reject(params);
        return deferred.promise;
    }

});