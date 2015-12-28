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

    App.value('CliConfiguration', {
        windowsX64: {
            name: 'Windows 64 bit',
            release: 'windows64',
            os: 'windows',
            order: 1
        },
        windowsX86: {
            name: 'Windows 32 bit',
            release: 'windows32',
            os: 'windows',
            order: 2
        },
        osxX64: {
            name: 'Mac OS X 64 bit',
            release: 'macosx64',
            os: 'apple',
            order: 3
        },
        debX64: {
            name: 'Linux 64 bit (.deb)',
            release: 'debian64',
            os: 'linux',
            order: 4
        },
        debX86: {
            name: 'Linux 32 bit (.deb)',
            release: 'debian32',
            os: 'linux',
            order: 5
        },
        rpmX64: {
            name: 'Linux 64 bit (.rpm)',
            release: 'redhat64',
            os: 'linux',
            order: 6
        },
        rpmX86: {
            name: 'Linux 32 bit (.rpm)',
            release: 'redhat32',
            os: 'linux',
            order: 7
        }

    });

}());
