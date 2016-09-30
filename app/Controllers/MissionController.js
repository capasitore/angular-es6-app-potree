const INIT = new WeakMap();
const SERVICE = new WeakMap();
const TIMEOUT = new WeakMap();

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
    constructor($timeout, applicationService, $mdDialog) {
        SERVICE.set(this, applicationService);
        TIMEOUT.set(this, $timeout);
        this.mdDialog = $mdDialog;
        this.people = people;

        INIT.set(this, () => {
            SERVICE.get(this).getActiveBooks().then(books => {
                this.books = books;
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


    doSecondaryAction(event) {
        this.mdDialog.show(
            this.mdDialog.alert()
            .title('Secondary Action')
            .textContent('Secondary actions can be used for one click actions')
            .ariaLabel('Secondary click demo')
            .ok('Neat!')
            .targetEvent(event)
        );
    };

}

MissionController.$inject = ['$timeout', 'applicationService', '$mdDialog'];
export default MissionController;