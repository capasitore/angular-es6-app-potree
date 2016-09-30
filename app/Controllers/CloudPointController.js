import { default as ViewerClass } from '../../potree/js/ViewerClass';

const sceneProperties = {
    path: "http://5.9.65.151/mschuetz/potree/resources/pointclouds/scott_reed/DoverMillRuins/cloud.js",
    cameraPosition: null,
    cameraTarget: null,
    sizeType: "Adaptive",
    quality: "Squares",
    fov: 75,
    material: "RGB",
    pointLimit: 1,
    navigation: "Orbit",
    pointSize: 1,
    useEDL: true,
};

const INIT = new WeakMap();
const SERVICE = new WeakMap();
const TIMEOUT = new WeakMap();

class CloudPointController {
    constructor($timeout, applicationService) {
        SERVICE.set(this, applicationService);
        TIMEOUT.set(this, $timeout);
        console.log('cloud point start..');
        this.sceneProperties = sceneProperties;

        // this.viewer = new ViewerClass(this.sceneProperties);
        // this.viewer.initThree();
        // this.viewer.loop();
    }
}

CloudPointController.$inject = ['$timeout', 'applicationService'];
export default CloudPointController;