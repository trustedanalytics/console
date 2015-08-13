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
App.filter('translateSize', function () {

    return function(bytes){
        var sizes = ['bytes','KB','MB','GB','TB','PB'];
        var index = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024,index)).toFixed(2) + ' ' + sizes[index];
    };
});
