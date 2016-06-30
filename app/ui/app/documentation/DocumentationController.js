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

(function () {
    "use strict";

    App.controller('DocumentationController', function ($scope, State, VersionResource) {

        var TAP_WIKI = "https://github.com/trustedanalytics/platform-wiki";
        var platformVersion;
        var state = new State().setPending();

        $scope.state = state;

        VersionResource.getSnapshots()
            .then(function (response) {
                platformVersion = response.platform_version;
                getLinkToPlatformWiki();
                $scope.state.setLoaded();
            })
            .catch(function onError() {
                $scope.platformWikiLink = TAP_WIKI;
                $scope.state.setLoaded();
            });

        function getLinkToPlatformWiki () {
            if(platformVersion) {
                var wikiVersion = platformVersion.split('.').slice(0,2).join('.');
                $scope.platformWikiLink = TAP_WIKI + '-' + wikiVersion + '/wiki';
            }
        }
    });
}());