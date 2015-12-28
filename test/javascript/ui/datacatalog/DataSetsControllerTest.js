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
describe("Unit: DataSetsController", function() {

    beforeEach(module('app'));

    var controller,
        scope,
        rootScope,
        state,
        dataSetResource,
        q,
        platformContextProvider,
        cookies,

        DEFAULT_TOOL_NAME = 'arcadia';

    beforeEach(inject(function($injector, $rootScope, State, $q){
        rootScope = $rootScope;
        q = $q;

        scope = rootScope.$new();

        rootScope.search = '';

        dataSetResource = {
            getByQuery: function(){
                return q.defer().promise;
            },
            withErrorMessage: function() {
                return this;
            }
        };
        platformContextProvider = {
            getPlatformContext: function() {
                return q.defer().promise;
            }
        };

        cookies = {
            get: sinon.stub(),
            put: sinon.stub()
        };

        getSUT($injector);
        state = scope.state;
    }));

    function getSUT($injector) {
        return controller = $injector.get('$controller')('DataSetsController', {
            $scope: scope,
            DataSetResource: dataSetResource,
            PlatformContextProvider: platformContextProvider,
            $cookies: cookies
        });
    }

    it('should not be null', function(){
        expect(controller).not.to.be.null;
    });

    it('search, set state pending', inject(function(){
        scope.search();

        expect(state.value).to.be.equal(state.values.PENDING);
    }));

    it('search, empty filters, send empty request', inject(function(){
        var query = null;
        dataSetResource.getByQuery = function(_query) {
            query = _query.query;
            return q.defer().promise;
        };

        scope.search();

        expect(query.query).to.be.empty;
        expect(query.filters).to.be.empty;
    }));

    it('onCategoryChange, send request with category', inject(function(){
        var query = null;
        dataSetResource.getByQuery = function(_query) {
            query = _query;
            return q.defer().promise;
        };

        scope.onCategoryChange('banana');

        expect(query.query).to.be.empty;
        expect(query.filters.length).to.be.equal(1);
        expect(query.filters[0].category).to.be.deep.equal(['banana']);
    }));

    it('onCategoryChange, send request with category', inject(function(){
        var query = null;
        dataSetResource.getByQuery = function(_query) {
            query = _query;
            return q.defer().promise;
        };

        scope.onCategoryChange('banana');

        expect(query.query).to.be.empty;
        expect(query.filters.length).to.be.equal(1);
        expect(query.filters[0].category).to.be.deep.equal(['banana']);
    }));

    it('format changed, send request with format', inject(function(){
        var query = null;
        dataSetResource.getByQuery = function(_query) {
            query = _query;
            return q.defer().promise;
        };

        scope.$apply();
        scope.format.value = 'banana';
        scope.$apply();

        expect(query.query).to.be.empty;
        expect(query.filters.length).to.be.equal(1);
        expect(query.filters[0].format).to.be.deep.equal(['banana']);
    }));

    it('created from, send request with created from', inject(function(){
        var query = null;
        dataSetResource.getByQuery = function(_query) {
            query = _query;
            return q.defer().promise;
        };

        scope.$apply();
        scope.created.from = 'banana';
        scope.$apply();

        expect(query.query).to.be.empty;
        expect(query.filters.length).to.be.equal(1);
        expect(query.filters[0].creationTime).to.be.deep.equal(['banana', -1]);
    }));

    it('created to, send request with created to', inject(function(){
        var query = null;
        dataSetResource.getByQuery = function(_query) {
            query = _query;
            return q.defer().promise;
        };
        var createdTo = new Date();

        scope.$apply();
        scope.created.to = createdTo;
        scope.$apply();

        expect(query.query).to.be.empty;
        expect(query.filters.length).to.be.equal(1);
        expect(query.filters[0].creationTime).to.be.deep.equal([-1, createdTo]);
    }));

    it('search changed, send request with query', inject(function(){
        var query = null;
        dataSetResource.getByQuery = function(_query) {
            query = _query;
            return q.defer().promise;
        };

        rootScope.$broadcast('searchChanged', 'banana');

        expect(query.query).to.be.equal('banana');
        expect(query.filters).to.be.empty;
    }));

    it('all filters set, send request with all filters', inject(function(){
        var query = null;
        dataSetResource.getByQuery = function(_query) {
            query = _query;
            return q.defer().promise;
        };
        var createdTo = new Date();

        scope.$apply();
        scope.created.from = 'mockfrom';
        scope.created.to = createdTo;
        scope.format.value = 'mockformat';
        scope.$apply();
        rootScope.$broadcast('searchChanged', 'mockquery');

        expect(query.query).to.be.equal('mockquery');
        expect(query.filters.length).to.be.equal(2);

        _.find(query.filters, function(f){
            return f.creationTime;
        });
        expect(findFilter(query.filters, 'creationTime')).to.be.deep.equal(['mockfrom', createdTo]);

        expect(findFilter(query.filters, 'format')).to.be.deep.equal(['mockformat']);
    }));

    it('current tool is available, leave current tool', inject(function($injector){
        var toolName = "currenttool";
        var sample_data = {"external_tools":{"others":[{name:'othertool1',available:true},{name:'othertool2',available:false},
            {name:'othertool3',available:true}],"visualizations":[{name:'vistool1',available:true},{name:'vistool2',available:false},
            {name:toolName,available:true}]}};

        sample_data.plain = function(){ return this; };

        platformContextProvider.getPlatformContext = sinon.spy(function() {
            var deferred = q.defer();
            deferred.resolve(sample_data);
            return deferred.promise;
        });
        cookies.get = sinon.stub().returns(toolName);

        getSUT($injector);
        rootScope.$apply();
        expect(scope.tool).to.be.equal(toolName);
    }));

    it('current tool not available but default is, set default tool', inject(function($injector){
        var sample_data = {"external_tools":{"others":[{name:'othertool1',available:true},{name:'othertool2',available:false},
            {name:'othertool3',available:true}],"visualizations":[{name:'vistool1',available:true},{name:'vistool2',available:false},
            {name:DEFAULT_TOOL_NAME,available:true}]}};
        sample_data.plain = function(){return this;};

        platformContextProvider.getPlatformContext = sinon.spy(function() {
            var deferred = q.defer();
            deferred.resolve(sample_data);
            return deferred.promise;
        });

        getSUT($injector);
        scope.tool = 'notexistingtool';
        rootScope.$apply();
        expect(scope.tool).to.be.equal(DEFAULT_TOOL_NAME);
    }));

    it('neither current nor default tool available, set first available tool on the list', inject(function($injector){
        var sample_data = {"external_tools":{"others":[{name:'othertool1',available:true},{name:'othertool2',available:false},
            {name:'othertool3',available:true}],"visualizations":[{name:'vistool1',available:false},{name:DEFAULT_TOOL_NAME,available:false},
            {name:'vistool3',available:true}]}};
        sample_data.plain = function(){return this;};

        platformContextProvider.getPlatformContext = sinon.spy(function() {
            var deferred = q.defer();
            deferred.resolve(sample_data);
            return deferred.promise;
        });

        getSUT($injector);
        scope.tool = 'notexistingtool';
        rootScope.$apply();
        expect(scope.tool).to.be.equal('vistool3');
    }));

    function findFilter(filters, name){
        var filter = _.find(filters, function(f){
            return f[name];
        });
        return filter && filter[name];
    }
});