var moduleName = 'application.services';

const HTTP = new WeakMap();

class ApplicationService {

    constructor($http) {
        HTTP.set(this, $http);
    }

    getActiveBooks() {
        return HTTP.get(this).get('/api/getall').then(result => result.data);
    }

    static applicationFactory($http) {
        return new ApplicationService($http);
    }
}

ApplicationService.applicationFactory.$inject = ['$http'];

angular.module(moduleName, [])
    .factory('applicationService', ApplicationService.applicationFactory);

export default moduleName;