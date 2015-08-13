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

    App.config(function(RestangularProvider, $httpProvider) {
        RestangularProvider.setBaseUrl('/rest');
        RestangularProvider.setRequestInterceptor(function(elem, operation) {
            if (operation === "remove") {
                return undefined;
            }
            return elem;
        });
        //set ajax header so backend can detect ajax requests
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

        //detecting session timeout
        $httpProvider.interceptors.push(function($q, $window) {
            return {
                'responseError': function(response) {
                    if(response.status === 401) {
                        //probably session expired. Reload the whole page so it is redirected to login form.
                        $window.location.reload();
                    }
                    return $q.reject(response);
                 }
            };
        });
    })
    .decorator('Restangular', ['$delegate', 'NotificationService', function($delegate, NotificationService) {
        return getRestangular(null, getGenericInterceptor());

        function getRestangular(parent, interceptor) {
            var restangular = $delegate.withConfig(function(RestangularConfigurer) {
                RestangularConfigurer.setErrorInterceptor(interceptor);
                RestangularConfigurer.setOnElemRestangularized(bindCustomMethods);
                if(parent) {
                    RestangularConfigurer.setBaseUrl('');
                }
            });

            var result = parent ? applyParent(restangular, parent) : restangular;

            bindCustomMethods(result);

            if(_.has(result, 'service')) {
                var serviceFunc = result.service;
                result.service = function() {
                    var newSerice = serviceFunc.apply(this, arguments);
                    bindCustomMethods(newSerice);
                    return newSerice;
                };
            }

            return result;
        }

        function applyParent(restangular, parent) {
            var result = restangular.service(getUrl(parent));
            // parent was "one"
            if(_.has(parent, 'id')) {
                result = result.one();
            }
            copyCustomMethods(result, parent, restangular.configuration.restangularFields);
            return result;
        }

        function bindCustomMethods(elem) {
            if(!Object.isFrozen(elem)) {
                elem.supressGenericError = _.partial(getRestangularWithEmptyInterceptor, elem);
                elem.withErrorMessage = _.partial(getRestangularWithGenericInterceptor, elem);
            }
            return elem;
        }

        function getRestangularWithEmptyInterceptor(parent) {
            return getRestangular(parent, getEmptyInterceptor());
        }

        function getRestangularWithGenericInterceptor(parent, message) {
            return getRestangular(parent, getGenericInterceptor(message));
        }

        function copyCustomMethods(target, source, ignoredFields) {
            _.each(_.functions(source), function(k) {
                if(!_.has(target, k) && !_.contains(ignoredFields, k)) {
                    target[k] = _.bind(source[k], target);
                }
            });
        }

        function getEmptyInterceptor() {
            return function emptyInterceptor() {
                return true;
            };
        }

        function getGenericInterceptor(message) {
            return function genericInterceptor(response) {
                NotificationService.genericError(response.data, message);
                return true;
            };
        }

        function getUrl(service) {
            return _.has(service, 'getRestangularUrl') ? service.getRestangularUrl() : service.one().getRestangularUrl();
        }
    }]);
}());
