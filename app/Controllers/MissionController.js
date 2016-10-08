const INIT = new WeakMap();
const SERVICE = new WeakMap();
const TIMEOUT = new WeakMap();

const selfinst = null;
const people = [
    { name: 'Janet Perkins', img: 'img/100-0.jpeg', newMessage: true },
    { name: 'Mary Johnson', img: 'img/100-1.jpeg', newMessage: false },
    { name: 'Kay Johnson', img: 'img/100-2.jpeg', newMessage: false },
    { name: 'Dany Johnson', img: 'img/100-0.jpeg', newMessage: false },
    { name: 'Tery Johnson', img: 'img/100-1.jpeg', newMessage: false },
    { name: 'San Johnson', img: 'img/100-0.jpeg', newMessage: false },
    { name: 'Tes Johnson', img: 'img/100-1.jpeg', newMessage: false },
    { name: 'Fary Johnson', img: 'img/100-1.jpeg', newMessage: false },
    { name: 'Peter Carlsson', img: 'img/100-2.jpeg', newMessage: false }
];

class MissionController {
    constructor($timeout, applicationService, $mdDialog, $scope) {
        SERVICE.set(this, applicationService);
        TIMEOUT.set(this, $timeout);
        this.mdDialog = $mdDialog;
        this.scope = $scope;
        this.scope.status = '  ';
        this.scope.customFullscreen = false;

        this.people = people;
        INIT.set(this, () => {
            SERVICE.get(this).getMissionList().then(todos => {
                this.todos = todos;
            });
        });
        INIT.get(this)();
    }
    goToPerson(person, event) {
        this.mdDialog.show(
            this.mdDialog.alert()
            .title('Navigating')
            .textContent('Inspect ' + person)
            .ariaLabel('Person inspect demo')
            .ok('Neat!')
            .targetEvent(event)
        );
    }
    loadmissionlist() {
        self = this;
        return SERVICE.get(self).getMissionList().then(todos => {
            self.todos = todos;
            INIT.get(self)();
            TIMEOUT.get(self)(() => {
                self.readSuccess = true;
            }, 2500);
        });
    }

    doSecondaryAction(event) {
        this.mdDialog.show(
            this.mdDialog.alert()
            .title('Secondary Action')
            .textContent('Secondary actions can be used for one click actions')
            .ariaLabel('Secondary click demo')
            .ok('Neat!')
            .targetEvent(event)
        );
    }
    showAdvanced(ev) {
        self = this;
        this.mdDialog.show({

                controller: DialogController,
                templateUrl: 'templates/formdialogtemplate.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: self.scope.customFullscreen
            })
            .then(function(answer) {
                console.log('You said the information was "' + answer + '".');
            }, function() {
                console.log('You cancelled the dialog.');
            });

        function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        }
    }
}

MissionController.$inject = ['$timeout', 'applicationService', '$mdDialog', '$scope'];
export default MissionController;