var moduleName = 'application.directives';

const Q = new WeakMap();
const SERVICE = new WeakMap();


class UniqueApplication {
    constructor($q, applicationService) {
        this.require = 'ngModel';
        this.restrict = 'A';

        Q.set(this, $q);
        SERVICE.set(this, applicationService);
    }

    static directiveFactory($q, bookShelfSvc) {
        UniqueApplication.instance = new UniqueApplication($q, applicationService);
        return UniqueApplication.instance;
    }
}

UniqueApplication.directiveFactory.$inject = ['$q', 'applicationService'];

angular.module(moduleName, [])
    .directive('UniqueApplication', UniqueApplication.directiveFactory);

export default moduleName;