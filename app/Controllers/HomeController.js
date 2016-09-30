const INIT = new WeakMap();
const SERVICE = new WeakMap();
const TIMEOUT = new WeakMap();

class HomeController {
    constructor($timeout, applicationService) {

        SERVICE.set(this, applicationService);

        TIMEOUT.set(this, $timeout);

    }
}

HomeController.$inject = ['$timeout', 'applicationService'];
export default HomeController;