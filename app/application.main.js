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
            .iconSet('navigation', 'img/icons/sets/navigation-symbol.svg', 24)
            .defaultIconSet('img/icons/sets/core-icons.svg', 24);
    }).config(config);

export default moduleName;