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

    App.factory('userAgent', ['uaParser', function (uaParser) {
        var linuxFamilies = ['mint', 'mageia', 'vectorlinux', 'joli', 'ubuntu', 'debian', 'suse', 'gentoo', 'arch',
            'slackware', 'fedora', 'mandriva', 'centos', 'pclinuxos', 'redhat', 'zenwalk', 'hurd', 'linux', 'gnu',
            'solaris', 'freebsd', 'netbsd', 'openbsd', 'pc-bsd', 'dragonfly', 'aix', 'unix'];


        /*
         * 'linux' parameter in deb array has been added for a situation
         * when browser cannot determine which distribution of linux
         * is used by user. It assumes that user is using the Debian-based one
         */
        var deb = ['mint', 'ubuntu', 'debian', 'linux'];
        var rpm = ['fedora', 'redhat', 'suse', 'centos', 'mandriva'];

        var userAgent = JSON.parse(JSON.stringify(uaParser.getResult()));

        var osName = (userAgent.os.name || '').toLowerCase();
        userAgent.family = false;
        if (linuxFamilies.indexOf(osName) > -1) {
            userAgent.family = 'linux';
        } else if (osName.indexOf('windows') > -1) {
            userAgent.family = 'windows';
        } else if (osName === 'mac os') {
            userAgent.family = 'osx';
        }
        userAgent.pkgFormat = deb.indexOf(osName) > -1 ? 'deb' : (rpm.indexOf(osName) > -1 ? 'rpm' : false);

        return userAgent;
    }]);

}());
