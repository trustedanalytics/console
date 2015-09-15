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
App.config(['$stateProvider', '$urlRouterProvider', 'LazyLoadProvider', 'AppConfig', 'UserView', '$sceProvider',
    function ($stateProvider, $urlRouterProvider, LazyLoadProvider, AppConfig, UserView, $sceProvider) {
        'use strict';

        // TODO: This is workaround for marketplace icons not loading
        $sceProvider.enabled(false);

        $urlRouterProvider.when('/app/datacatalog', '/app/datacatalog/datasets');
        $urlRouterProvider.otherwise('/app/dashboard');

        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: getViewPath('main/app.html'),
                resolve: LazyLoadProvider.load(['icons'])
            })
            .state('app.dashboard', {
                url: '/dashboard',
                title: 'Dashboard',
                controller: 'DashboardController',
                templateUrl: getViewPath('dashboard/dashboard.html'),
                resolve: LazyLoadProvider.load(['c3charts-serial'])
            })
            .state('app.latestevents', {
                url: '/events',
                controller: 'LatestEventsController',
                templateUrl: getViewPath('latestevents/events.html')
            })
            .state('app.invite', {
                url: '/invite',
                title: 'Invite new user',
                controller: 'InvitationSendController as ctrl',
                templateUrl: getViewPath('manageusers/invite/invite.html')
            })
            .state('app.marketplace', {
                url: '/marketplace',
                title: 'Marketplace',
                controller: 'ServicesController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('marketplace/list/services.html')
            })
            .state('app.service', {
                url: '/service/:serviceId',
                title: 'Service',
                controller: 'ServiceController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('marketplace/service/service.html')
            })
            .state('app.applications', {
                url: '/applications',
                title: 'Applications',
                controller: 'ApplicationsController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('applications/list/apps.html')
            })
            .state('app.application', {
                url: '/application/:appId',
                title: 'Application',
                controller: 'ApplicationController',
                controllerAs: 'appCtrl',
                templateUrl: getViewPath('applications/application/application.html')
            })
            .state('app.application.overview', {
                url: '/overview',
                title: 'Application',
                templateUrl: getViewPath('applications/application/overview.html')
            })
            .state('app.application.bindings', {
                url: '/bindings',
                title: 'Application',
                controller: 'ApplicationBindingsController',
                controllerAs: 'bindCtrl',
                templateUrl: getViewPath('applications/application/bindings.html')
            })
            .state('app.appcli', {
                url: '/tools',
                title: 'Tools',
                controller: 'ToolsController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('tools/tools.html'),
                resolve: LazyLoadProvider.load(['highlightjs'])
            })
            .state('app.datatools', {
                url: '/datatools',
                title: 'Data scientist CLI',
                controller: 'DataToolsController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('tools/datatools.html'),
                resolve: LazyLoadProvider.load(['highlightjs'])
            })
            .state('app.ipython', {
                url: '/ipython',
                title: 'IPython console',
                controller: 'IPythonController',
                templateUrl: getViewPath('tools/ipython.html'),
                resolve: LazyLoadProvider.load(['highlightjs'])
            })
            .state('app.datacatalog', {
                url: '/datacatalog',
                controller: 'DataCatalogController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('datacatalog/datacatalog.html')
            })
            .state('app.datacatalog.datasets', {
                url: '/datasets',
                title: 'Data sets',
                controller: 'DataSetsController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('datacatalog/datasets/datasets.html'),
                resolve: LazyLoadProvider.load(['dibari.angular-ellipsis'])
            })
            .state('app.dataset', {
                url: '/dataset/:datasetId',
                title: 'Data set',
                controller: 'DataSetController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('datacatalog/datasets/dataset.html'),
                resolve: LazyLoadProvider.load(['xeditable'])
            })
            .state('app.datacatalog.transfers', {
                url: '/transfers',
                title: 'Data transfers',
                controller: 'DataSetTransferListController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('datacatalog/transfers/transfers.html')
            })
            .state('app.datacatalog.upload', {
                url: '/upload',
                title: 'Upload a dataset',
                controller: 'UploadDataSetController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('datacatalog/transfers/upload.html'),
                resolve: LazyLoadProvider.load(['file-upload'])
            })
            .state('app.manage', {
                url: '/manage',
                abstract: true,
                template: '<ui-view />'
            })
            .state('app.manage.orgusers', {
                url: '/orgusers',
                title: 'Manage users in your organization',
                controller: 'ManageUsersController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('manageusers/users/user.html'),
                resolve: angular.extend(LazyLoadProvider.load(['parsley']), {
                    userViewType: function() { return UserView.ORGANIZATIONS;}
                })
            })
            .state('app.manage.spaceusers', {
                url: '/spaceusers',
                title: 'Manage users in your space',
                controller: 'ManageUsersController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('manageusers/users/user.html'),
                resolve: angular.extend(LazyLoadProvider.load(['parsley']), {
                    userViewType: function() { return UserView.SPACES;}
                })
            })
            .state('app.manage.organizations', {
                url: '/organizations',
                title: 'Organizations',
                controller: 'OrganizationsController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('manageusers/organizations/organizations.html')
            })
            .state('app.manage.organizations.manage', {
                url: '/manageorganizations/:orgId',
                title: 'Manage organizations',
                controller: 'ManageOrganizationsController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('manageusers/organizations/manageorganizations.html'),
                resolve: LazyLoadProvider.load(['xeditable'])
            })
            .state('app.manage.organizations.add', {
                url: '/addorganization',
                title: 'Add organization',
                controller: 'AddOrganizationsController',
                controllerAs: 'ctrl',
                templateUrl: getViewPath('manageusers/organizations/addorganization.html'),
                resolve: LazyLoadProvider.load(['parsley'])
            })
            .state('app.changepassword', {
                url: '/changepassword',
                title: 'Change password',
                controller: 'ChangePasswordController',
                templateUrl: getViewPath('changepassword/changepassword.html'),
                resolve: LazyLoadProvider.load(['parsley'])
            })
            .state('app.terms', {
                url: '/termsofuse',
                title: 'Terms of Use',
                templateUrl: getViewPath('legal/termsOfUse.html'),
                resolve: LazyLoadProvider.load(['parsley'])
            });

        function getViewPath(path) {
            return AppConfig.viewsBase + path;
        }
    }]);
