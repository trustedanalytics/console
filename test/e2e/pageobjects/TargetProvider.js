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
var _ = require('underscore');
var targetProviderPage = function() {
    return {
        setOrganization: function(name) {
            browser.wait(function() {
                return element(by.css('d-target-selector button.org-button')).isPresent();
            }, 2000);

            element(by.css('button.org-button')).click();
            browser.wait(function() {
                return element(by.css('d-target-selector ul')).isPresent();
            }, 2000);

            return element.all(by.css('d-target-selector ul li a'))
                .filter(function(link) {
                    return link.getInnerHtml().then(function(orgName){
                        return orgName === name;
                    })
                })
                .then(function(filteredLinks){
                    filteredLinks[0].click();
                });
        }
    }
};

module.exports.targetProviderPage = targetProviderPage;
