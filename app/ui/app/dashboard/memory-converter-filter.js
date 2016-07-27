/**
 * Copyright (c) 2016 Intel Corporation
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
App.filter('memoryConverter', function() {
    var memorySizes = {
        B: 1,
        KB: 1024,
        MB: 1024*1024,
        GB: 1024*1024*1024,
        TB: 1024*1024*1024*1024,
    };

    return function(input, destUnit, sourceUnit) {
        sourceUnit = _.isString(sourceUnit) && sourceUnit.toUpperCase();
        if(_.isEmpty(sourceUnit)) {
            sourceUnit = 'B';
        }
        destUnit = _.isString(destUnit) ? destUnit.toUpperCase() : sourceUnit;
        if(!memorySizes[sourceUnit] || !memorySizes[destUnit]) {
            throw 'Incorrect value of source or destination units ' + sourceUnit + ' ' + destUnit;
        }
        return input * memorySizes[sourceUnit] / memorySizes[destUnit];
    };
});