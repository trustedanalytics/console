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

    function IncorrectTargetException(message) {
        this.name = "IncorrectTargetException";
        this.message = message;
    }

    IncorrectTargetException.prototype = Error.prototype;


    App.service('targetUrlBuilder', function (targetProvider) {
        var self = this;

        var config = {
            useOrganization: false,
            useService: false
        };
        self.useOrganization = function () {
            config.useOrganization = true;
            return self;
        };
        self.useSpace = function () {
            config.useSpace = true;
            return self;
        };
        self.get = function (path) {
            var url = "/rest";
            if (config.useOrganization) {
                if (!targetProvider.getOrganization()) {
                    throw new IncorrectTargetException("Organization not specified");
                }
                url = url + "/organizations/" + targetProvider.getOrganization().guid;
            }
            if (config.useSpace) {
                if (!targetProvider.getSpace()) {
                    throw new IncorrectTargetException("Space not specified");
                }
                url = url + "/spaces/" + targetProvider.getSpace().guid;
            }
            if (typeof path === "string" && path.length > 0) {
                url = url + "/" + path.replace(/^\/+|\/+$/g, '');
            }
            return url;
        };
    });

}());
