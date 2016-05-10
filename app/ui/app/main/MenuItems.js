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
            "text": "Operations",
            "icon": "icon-puzzle",
            "items": [
                {
                    "text": "Platform Dashboard",
                    "sref": "app.platformdashboard"
                },
                {
                    "text": "Platform Tests",
                    "sref": "app.platformtests"
                },
                {
                    "text": "Version Tracking",
                    "sref": "app.versiontracking"
                }
            ],
            "access": ["admin"]
        },
        {
            "text": "Dashboard",
            "sref": "app.dashboard",
            "icon": "icon-speedometer"
        }, {
            "text": "Data catalog",
            "sref": "app.datacatalog",
            "icon": "icon-folder-alt"
        }, {
            "text": "Model catalog",
            "sref": "app.modelcatalog",
            "icon": "icon-folder-alt",
            "tool": "h2o"
        }, {
            "text": "Job Scheduler",
            "icon": "icon-hourglass",
            "items": [
                {
                    "text": "Import data",
                    "sref": "app.jobsscheduler.importdata.fromdatabase"
                },
                {
                    "text": "Job browser",
                    "sref": "app.jobsscheduler.jobs.workflowjobs"
                }
            ]
        }, {
            "text": "Applications",
            "sref": "app.applications",
            "icon": "icon-grid"
        }, {
            "text": "Services",
            "icon": "icon-bag",
            "items": [
                {
                    "text": "Marketplace",
                    "sref": "app.services.marketplace"
                }, {
                    "text": "Instances",
                    "sref": "app.services.instances"
                }
            ]
        }, {
            "text": "App Development",
            "icon": "fa-building",
            "sref": "app.appcli"
        },{
            "text": "Data Science",
            "id": "datascience",
            "icon": "icon-wrench",
            "items": [
                {
                    "text": "TAP Analytics Toolkit",
                    "sref": "app.datatools"
                },  {
                    "text": "IPython",
                    "sref": "app.ipython",
                    "tool": 'ipython'
                },  {
                    "text": "RStudio®",
                    "sref": "app.rstudio",
                    "tool": "rstudio"
                }, {
                    "text": "H2O",
                    "sref": "app.h2o",
                    "tool": "h2o"
                }, {
                    "text": "Apache Gearpump",
                    "sref": "app.gearpump",
                    "tool": "gearpump"
                }, {
                    "text": "Jupyter",
                    "sref": "app.jupyter",
                    "tool": "jupyter"
                }

            ]
        }, {
            "text": "User management",
            "icon": "icon-people",
            "items": [
                {
                    "text": "Onboarding",
                    "sref": "app.manage.invite.send",
                    "access": ["admin"]
                }, {
                    "text": "Manage organization users",
                    "sref": "app.manage.orgusers",
                    "access": ["admin", "currentOrgManager"]
                }, {
                    "text": "Manage space users",
                    "sref": "app.manage.spaceusers",
                    "access": ["admin", "currentOrgManager"]
                }, {
                    "text": "Manage organizations",
                    "sref": "app.manage.organizations.manage",
                    "access": ["admin", "anyOrgManager"]
                }
            ],
            "access": ["admin", "anyOrgManager"]
        }, {
            "text": "Event Log",
            "sref": "app.latestevents",
            "icon": "icon-book-open"
        }
    ]);
})();
