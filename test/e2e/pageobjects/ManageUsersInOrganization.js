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
'use strict'
var _ = require('underscore');

var userOnListPage = function(rowLocator) {
    var locator = rowLocator;

    function getHeaders() {
        return element.all(by.css('table.user-list thead th')).getText();
    }

    function getRoleNames() {
        return getHeaders().then(function(headers){
            return headers.slice(1, 4);
        });
    }

    return {
        getRoles: function () {
            return getRoleNames()
                .then(function(roleNames) {
                    return locator.all(by.css('input')).isSelected().then(function(selected) {
                        var roles = [];
                        selected.forEach(function(val, i) {
                            if(val) {
                                roles.push(roleNames[i]);
                            }
                        });
                        return roles;
                    });
                });
        },
        getUsername: function() {
            return locator.all(by.css('td')).first().getText();
        },
        clickDelete: function() {
            return locator.all(by.css('td')).last().element(by.css('a')).click();
        },
        clickRole: function(roleName) {
            getHeaders().then(function(headers) {
                var idx = _.findIndex(headers, function(hdr) {
                    return hdr === roleName;
                });

                return locator.all(by.css('td')).get(idx).element(by.css('input[type="checkbox"]')).click();
            })
        }
    }
};

var userListPage = function() {
    var userPages = [];
    return {
        addUserPage: function(userPage) {
            userPages.push(userPage);
        },
        getPages : function() {
            return userPages;
        }
    }
}

var manageUsersInOrganizationPage = function() {
    return {
        get: function (orgId) {
            return browser.get('/#/app/manage/orgusers');
        },
        getUserList: function () {
            var list = userListPage();
            return element.all(by.css('.user-list .user-list-item'))
                .each(function(row, i) {
                    list.addUserPage(userOnListPage(row));
                })
                .then(function() {
                    return list;
                })

        },
        waitForDeleteDialog: function() {
            browser.sleep(2000);
        },
        waitForToastMessage: function() {
            browser.wait(function() {
                return element(by.css('.toast-message')).isPresent();
            }, 2000);
        },
        confirmDelete: function() {
            return element(by.css('.ngdialog button.btn-primary')).click();
        },
        cancelDelete: function() {
            return element(by.css('.ngdialog button.btn-default')).click();
        },
    }
};

module.exports.manageUsersInOrganizationPage = manageUsersInOrganizationPage;