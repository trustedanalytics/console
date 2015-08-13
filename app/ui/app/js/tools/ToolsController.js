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

    App.controller('ToolsController', ['userAgent','NotificationService', 'PlatformContextResource',
                                       function (userAgent, NotificationService, PlatformContextResource) {
        var self = this;

        var clis = {
                windowsX64: {
                    name: 'Windows 64 bit',
                    url: 'https://cli.run.pivotal.io/stable?release=windows64&source=github',
                    os: 'windows',
                    order: 1
                },
                windowsX86: {
                    name: 'Windows 32 bit',
                    url: 'https://cli.run.pivotal.io/stable?release=windows32&source=github',
                    os: 'windows',
                    order: 2
                },
                osxX64: {
                    name: 'Mac OS X 64 bit',
                    url: 'https://cli.run.pivotal.io/stable?release=macosx64&source=github',
                    os: 'apple',
                    order: 3
                },
                debX64: {
                    name: 'Linux 64 bit (.deb)',
                    url: 'https://cli.run.pivotal.io/stable?release=debian64&source=github',
                    os: 'linux',
                    order: 4
                },
                debX86: {
                    name: 'Linux 32 bit (.deb)',
                    url: 'https://cli.run.pivotal.io/stable?release=debian32&source=github',
                    os: 'linux',
                    order: 5
                },
                rpmX64: {
                    name: 'Linux 64 bit (.rpm)',
                    url: 'https://cli.run.pivotal.io/stable?release=redhat64&source=github',
                    os: 'linux',
                    order: 6
                },
                rpmX86: {
                    name: 'Linux 32 bit (.rpm)',
                    url: 'https://cli.run.pivotal.io/stable?release=redhat32&source=github',
                    os: 'linux',
                    order: 7
                }
            },
            is64Bit = function () {
                return (userAgent.cpu || {}).architecture === 'amd64';
            },
            currentPackage = false;

        switch (userAgent.family) {
            case 'windows':
                currentPackage = is64Bit() ? clis.windowsX64 : clis.windowsX86;
                break;
            case 'linux':
                if (userAgent.pkgFormat === 'deb') {
                    currentPackage = is64Bit() ? clis.debX64 : clis.debX86;
                } else if (userAgent.pkgFormat === 'rpm') {
                    currentPackage = is64Bit() ? clis.rpmX64 : clis.rpmX86;
                }
                break;
            case 'osx':
                currentPackage = clis.osxX64;
                break;
            default:
                currentPackage = false;
        }

        self.currentPackage = currentPackage;

        PlatformContextResource
            .withErrorMessage("Error while fetching platform context")
            .getPlatformContext()
            .then(function onSuccess(data){
                // get the endpoint address, remove trailing / if present
                self.apiEndpoint = data.apiEndpoint.replace(/\/$/, '');
            });

        self.clis = clis;

    }]);
}());
