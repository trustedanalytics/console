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

    App.directive('dateTimePicker', function() {
        return {
            require: ['ngModel'],
            restrict: 'E',
            scope: {
                minDate: '=',
                required: '='
            },
            link: function (scope, element, attrs, ctrls) {
                var el = $(element).children(".input-group");
                var ngModel = ctrls[0];
                var pickerchild = el.datetimepicker({
                    minDate: scope.minDate
                });
                pickerchild.on("dp.change", function () {
                    ngModel.$setViewValue($(element).children('.input-group').children("input").val());
                });
            },
            templateUrl: 'app/common/directives/datetimepicker.html'
        };
    });
})();