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

    App.factory('PlatformContextProvider', function (PlatformContextResource, ExternalToolResource, $q) {
        var platformContext = null;
        var externalTools = {};
        return {
            getPlatformContext: function () {
                if (platformContext) {
                    var deferred = $q.defer();
                    deferred.resolve(platformContext);
                    return deferred.promise;
                } else {
                    return PlatformContextResource
                        .withErrorMessage("Error while fetching platform context")
                        .getPlatformContext()
                        .then(function success(data) {
                            platformContext = data.plain();
                            return platformContext;
                        });
                }
            },
            getExternalTools: function (org) {
                if (externalTools[org]) {
                    var deferred = $q.defer();
                    deferred.resolve(externalTools[org]);
                    return deferred.promise;
                } else {
                    return ExternalToolResource
                        .withErrorMessage("Error while fetching platform context")
                        .getExternalTools(org)
                        .then(function success(data) {
                            externalTools[org] = data.plain();
                            return externalTools[org];
                        });
                }
            }
        };
    });

}());
