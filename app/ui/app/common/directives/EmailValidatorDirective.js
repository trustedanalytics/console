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

    /* The syntax of valid email address is formally defined in RFC 5321.
     * According to that document an email address should consist of
     * following numbers of characters listed below.
     */

    var MAX_NUMBER_OF_CHARACTERS_IN_DOMAIN_PART = 252;
    var MAX_NUMBER_OF_CHARACTERS_IN_LOCAL_PART = 64;
    var MAX_NUMBER_OF_CHARACTERS_IN_EMAIL_IN_TOTAL = 254;

    App.directive('emailValidator', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ctrl) {
                function validator(ngModelValue) {
                    var emailRegex = new RegExp("^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@" +
                    "(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$");

                    var user = ngModelValue.substring(0, ngModelValue.indexOf('@'));
                    var domain = ngModelValue.substring(ngModelValue.indexOf('@')+1);

                    if (emailRegex.test(ngModelValue) && user.length <= MAX_NUMBER_OF_CHARACTERS_IN_LOCAL_PART &&
                        domain.length <= MAX_NUMBER_OF_CHARACTERS_IN_DOMAIN_PART &&
                        ngModelValue.length <= MAX_NUMBER_OF_CHARACTERS_IN_EMAIL_IN_TOTAL) {

                        ctrl.$setValidity('emailValidator', true);
                    } else {
                        ctrl.$setValidity('emailValidator', false);
                    }

                    return ngModelValue;
                }

                ctrl.$parsers.push(validator);
            }
        };
    });
}());
