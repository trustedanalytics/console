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
(function(){
    "use strict";

    App.factory('DasResource', function(Restangular, targetProvider) {
        var das = Restangular.all('das').all('requests');

        var organization = targetProvider.getOrganization();

        das.getTransfers = function () {
            return this.getList({orgs: organization.guid});
        };

        das.postTransfer = function (transfer, isPublic) {
            if(!isPublic){
                isPublic = false;
            }
            var orgId = organization.guid;
            transfer["orgUUID"] = orgId;
            transfer["publicRequest"] = isPublic;
            return this.post(transfer);
        };

        return das;
    });
}());


