import HomeController from './HomeController';
import MissionController from './MissionController';
import CloudPointController from './CloudPointController';


var moduleName = 'application.controllers';

angular.module(moduleName, [])
    .controller('application.homeController', HomeController)
    .controller('application.missionController', MissionController)
    .controller('application.cloudpointController', CloudPointController);

export default moduleName;