const INIT = new WeakMap();
const SERVICE = new WeakMap();
const TIMEOUT = new WeakMap();

class DialogController {
    constructor($timeout, applicationService, $mdDialog, $scope) {
        SERVICE.set(this, applicationService);
        TIMEOUT.set(this, $timeout);
        this.mdDialog = $mdDialog;
        console.log('DialogController');
        this.scope = $scope;
        this.mdDialog = $mdDialog;
        self = this;
        this.scope.hide = function() {
            self.mdDialog.hide();
        };
    }


}

DialogController.$inject = ['$timeout', 'applicationService', '$mdDialog', '$scope'];
export default DialogController;