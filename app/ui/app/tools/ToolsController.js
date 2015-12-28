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

    App.controller('ToolsController', function ($scope, userAgent, CliConfiguration, PlatformContextProvider, State) {
        var baseUrl = '',
            cliVersion = 'latest',
            architectureSymbol = getArchitectureSymbol(userAgent),
            state = new State().setPending();

        $scope.state = state;
        $scope.clis = _.values(CliConfiguration);
        $scope.currentPackage = getCurrentPackage();

        PlatformContextProvider
            .getPlatformContext()
            .then(function onSuccess(platformContext) {
                cliVersion = platformContext.cli_version || 'latest';
                baseUrl = platformContext.cli_url || '';
                // get the endpoint address, remove trailing / if present
                $scope.apiEndpoint = platformContext.api_endpoint.replace(/\/$/, '');
            })
            .then(function() {
                $scope.currentPackageUrl = $scope.getCliUrl($scope.currentPackage);
                state.setLoaded();
            });

        $scope.getCliUrl = function(cli) {
            return getCliUrl(cli, baseUrl, cliVersion);
        };


        function getCurrentPackage() {
            switch (userAgent.family) {
                case 'windows':
                    return CliConfiguration[userAgent.family + architectureSymbol];
                case 'linux':
                    return CliConfiguration[userAgent.pkgFormat + architectureSymbol];
                case 'osx':
                    return CliConfiguration.osxX64;
                default:
                    return null;
            }
        }

    });

    function getCliUrl(cliInfo, baseUrl, cliVersion) {
        return baseUrl
            .replace('{RELEASE}', cliInfo.release)
            .replace('{VERSION}', cliVersion);
    }


    function getArchitectureSymbol(userAgent) {
        return is64Bit(userAgent) ? 'X64' : 'X86';
    }

    function is64Bit(userAgent) {
        return (userAgent.cpu || {}).architecture === 'amd64';
    }
}());
