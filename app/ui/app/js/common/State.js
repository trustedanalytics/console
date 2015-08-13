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

    function State() {
    }

    State.prototype = angular.extend({
        values: {
            DEFAULT: 0,
            PENDING: 1,
            LOADED: 2,
            ERROR: 3,
            NOT_FOUND: 404,
            CONFLICT: 409
        },

        value: null,

        is: function(value){
            return this.value === value;
        },
        isDefault: function(){
            return this.is(this.values.DEFAULT);
        },
        isPending: function(){
            return this.is(this.values.PENDING);
        },
        isLoaded: function(){
            return this.is(this.values.LOADED);
        },
        isGenericError: function(){
            return this.is(this.values.ERROR);
        },
        isError: function(){
            return this.isGenericError() || this.value >= 400;
        },

        set: function(value){
            this.value = value;
            return this;
        },
        setDefault: function(){
            return this.set(this.values.DEFAULT);
        },
        setPending: function(){
            return this.set(this.values.PENDING);
        },
        setLoaded: function(){
            return this.set(this.values.LOADED);
        },
        setError: function(value) {
            return this.set(this.has(value) ? value : this.values.ERROR);
        },

        has: function(value){
            return _.values(this.values).indexOf(value) > -1;
        }

    }, Object.prototype);


    App.value('State',State);

}());
