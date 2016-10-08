import { default as controllersModuleName } from './Controllers/application.controllers';
import { default as servicesModuleName } from './application.services';
import { default as directivesModuleName } from './application.services';

var moduleName = 'application';

function config($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/home.html',
            controller: 'application.homeController',
            controllerAs: 'vm'
        })
        .when('/mission', {
            templateUrl: 'templates/mission.html',
            controller: 'application.missionController',
            controllerAs: 'vm'
        })
        .when('/missionform', {
            templateUrl: 'templates/missionform.html',
            controller: 'application.missionController',
            controllerAs: 'vm'
        })
        .when('/lion', {
            templateUrl: 'templates/lion.html',
            controller: 'application.cloudpointController',
            controllerAs: 'vm'
        })
        .otherwise({ redirectTo: '/' });
}

config.$inject = ['$routeProvider'];

var app = angular.module(moduleName, ['ngRoute', 'ngMessages', 'ngMaterial', servicesModuleName, controllersModuleName, directivesModuleName])
    .config(function($mdIconProvider, $mdThemingProvider) {
        $mdIconProvider
            .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
            .iconSet('communication', 'img/icons/sets/communication-icons.svg', 24)
            .iconSet('navigation', 'bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-navigation.svg', 24)
            .iconSet('file', 'bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-file.svg', 24)
            .iconSet('action', 'bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-action.svg', 24)
            .iconSet('device', 'bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-image.svg', 24)
            .icon('ic_cloud', 'bower_components/material-design-icons/file/svg/production/ic_cloud_48px.svg')

        .defaultIconSet('img/icons/sets/core-icons.svg', 24);
    }).config(config);

export default moduleName;