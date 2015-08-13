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
var manageUsersInOrganizationPage = require('./pageobjects/ManageUsersInOrganization.js').manageUsersInOrganizationPage;
var targetProviderPage = require('./pageobjects/TargetProvider.js').targetProviderPage;


describe('User Management Tests', function() {
    var manageUsersInOrganization,
        targetProvider;

    beforeEach(function() {
        browser.driver.manage().window().setSize(1280, 1080);
        manageUsersInOrganization = manageUsersInOrganizationPage();
        targetProvider = targetProviderPage();
        manageUsersInOrganization.get();
        browser.waitForAngular();
    })

    it('should load organization users list', function() {
        targetProvider.setOrganization('test-org')
            .then(function() {
                return manageUsersInOrganization.getUserList();
            })
            .then(function(userList) {
                expect(userList.getPages().length).toEqual(3);
            });

    });

    it('should delete user on clicking delete icon', function() {
        var userPage;
        var username;
        targetProvider.setOrganization('test-org')
            .then(manageUsersInOrganization.getUserList)
            .then(function(userList) {
                userPage = userList.getPages()[2];
                return userPage.getUsername();
            })
            .then(function(value) {
                username = value;
                return userPage.clickDelete()
            })
            .then(manageUsersInOrganization.waitForDeleteDialog)
            .then(manageUsersInOrganization.confirmDelete)
            .then(manageUsersInOrganization.waitForToastMessage)
            .then(function() {
                expect(element(by.css('.toast-message div')).getText()).toBe("User "+username+" has been deleted");
            });
    });

    it('should update user\'s privileges on clicking checkbox', function() {
        var userPage;
        var username;
        targetProvider.setOrganization('test-org')
            .then(manageUsersInOrganization.getUserList)
            .then(function(userList) {
                userPage = userList.getPages()[0];
                return userPage.getUsername();
            })
            .then(function(value) {
                username = value;
                return userPage.clickRole('Billing Manager');
            })
            .then(manageUsersInOrganization.waitForToastMessage)
            .then(function() {
                expect(element(by.css('.toast-message div')).getText()).toBe(username+"'s roles has been updated");
                expect(userPage.getRoles()).toEqual(['Billing Manager', 'Org Manager']);
            });

    });

    it('should add user on submitting form', function() {
        targetProvider.setOrganization('test-org')
            .then(function() {
                return element(by.css('a[ng-click="changeTab(2)"]')).click();
            })
            .then(function() {
                return element(by.id('add-username')).sendKeys("test");
            })
            .then(function() {
                return element(by.css('input[type="submit"]')).click();
            })
            .then(function() {
                expect(
                    element(by.id('add-username')).element(by.xpath('..')).all(by.css('ul li')).get(0).getText(),
                    'This value should be a valid email.');
                expect(
                    element(by.id('add-role')).element(by.xpath('..')).all(by.css('ul li')).get(0).getText(),
                    'This value should be a valid email');
            })
            .then(function() {
                return element(by.id('add-username')).sendKeys("@example.com");
            })
            .then(function() {
                return element(by.id('add-role')).click();
            })
            .then(function() {
                return element(by.id('add-role')).all(by.css('option')).get(3).click();
            })
            .then(function() {
                return element(by.css('input[type="submit"]')).click();
            })
            .then(function() {
                element.all(by.css('ul[ng-init="tab=1"] li')).get(0).getAttribute('class').then(function (classes) {
                    expect(classes.split(' ').indexOf('active') !== -1).toBe(true);
                });
                expect(element(by.css('.toast-message div')).getText()).toBe('User test@example.com has been added');
            });
    });

});
