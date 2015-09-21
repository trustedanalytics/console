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
    App.value('MenuItems', [
        {
            "text": "Dashboard",
            "sref": "app.dashboard",
            "icon": "icon-speedometer"
        }, {
            "text": "Data catalog",
            "sref": "app.datacatalog",
            "icon": "icon-folder-alt"
        }, {
            "text": "Applications",
            "sref": "app.applications",
            "icon": "icon-grid"
        }, {
            "text": "Marketplace",
            "sref": "app.marketplace",
            "icon": "icon-bag"
        }, {
            "text": "Tools",
            "icon": "icon-wrench",
            "items": [
                {
                    "text": "App Developer",
                    "sref": "app.appcli"
                }, {
                    "text": "Data Scientist",
                    "sref": "app.datatools"
                },  {
                    "text": "IPython",
                    "sref": "app.ipython"
                },  {
                    "text": "RStudio",
                    "sref": "app.rstudio"
                }
            ]
        }, {
            "text": "User management",
            "icon": "icon-users",
            "items": [
                {
                    "text": "Onboarding",
                    "sref": "app.invite",
                    "access": ["admin"]
                }, {
                    "text": "Manage organization users",
                    "sref": "app.manage.orgusers"
                }, {
                    "text": "Manage space users",
                    "sref": "app.manage.spaceusers"
                }, {
                    "text": "Manage organizations",
                    "sref": "app.manage.organizations.manage",
                    "access": ["admin"]
                }
            ],
            "access": ["admin", "manager"]
        }
    ]);
})();