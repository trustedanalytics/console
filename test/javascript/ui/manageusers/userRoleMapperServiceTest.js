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
describe("Unit: UsersRoleMapperService", function () {
    var UserRoleMapperService;
    var checkboxes = {
        "1234": {
            billing_managers: false,
            managers: false,
            auditors: true
        },
        "2345": {
            billing_managers: false,
            managers: true,
            auditors: true
        }
    };
    beforeEach(module('app'));

    beforeEach(inject(function (_UserRoleMapperService_) {
        UserRoleMapperService = _UserRoleMapperService_;
    }));

    it('should convert user roles to checkboxes', function() {
        var roles = UserRoleMapperService.mapCheckboxesToRoles({guid: "1234"}, checkboxes);
        expect(roles).to.be.deep.equal(["auditors"]);
    });

    it('should convert user checkboxes to roles', function() {
        var users = [
            {
                guid: "1234",
                roles: ["auditors"]
            },
            {
                guid: "2345",
                roles: ["auditors", "managers"]
            }
        ];

        var expectedCheckboxes = {
            "1234": {
                auditors: true
            },
            "2345": {
                auditors: true,
                managers: true
            }
        };
        var resultCheckboxes = UserRoleMapperService.mapRolesToCheckboxes(users);
        expect(resultCheckboxes).to.be.deep.equal(expectedCheckboxes);
    });

    it('should convert single role to one element array', function() {
        var user = {
            username: "bozydar",
            role: "admin"
        };
        var expectedUser = {
            username: "bozydar",
            roles: ["admin"]
        };
        var resultUser = UserRoleMapperService.mapSingleRoleToArray(user);
        expect(resultUser).to.be.deep.equal(expectedUser);
    });

});