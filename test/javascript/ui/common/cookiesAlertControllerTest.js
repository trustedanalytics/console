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
describe("Unit: CookiesAlertController", function() {

    var POLICY_KEY = 'cookiesPolicyAccepted',

        controller,
        createController,
        rootScope,
        scope,
        cookies;

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $rootScope, $cookies){

        rootScope = $rootScope;
        scope = rootScope.$new();
        cookies = $cookies;

        cookies.remove(POLICY_KEY);

        createController = function () {
            controller = $controller('CookiesAlertController', {
                $scope: scope,
                $cookies: cookies
            });
        };
    }));

    it('should set cookiesPolicyAccepted if the user confirmed', function() {
        createController();
        scope.cookiesConfirm();
        expect(cookies.get(POLICY_KEY)).to.be.ok;
    });

    it('should not set cookiesPolicyAccepted if the user did not confirm', function() {
        createController();
        expect(cookies.get(POLICY_KEY)).to.be.not.ok;
    });

    it('should not show cookies alert if the user confirmed', function() {
        createController();
        scope.cookiesConfirm();
        expect(scope.cookiesAlert()).to.be.not.ok;
    });

    it('should show cookies alert if the user did not confirm', function() {
        createController();
        expect(scope.cookiesAlert()).to.be.ok;
    });
});
