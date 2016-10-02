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
//---------------------------
var gui = null;
var pointCountTarget = null;
var pointSize = null;
var opacity = null;
var showStats = null;
var showBoundingBox = null;
var freeze = null;
var useDEMCollisions = null;
var minNodeSize = null;
//------------------------
var fov = null;
var pointSizeType = null;
var pointcloud;
var stats;


class CloudPointController {
    constructor($timeout, applicationService) {
        SERVICE.set(this, applicationService);
        TIMEOUT.set(this, $timeout);
        console.log('cloud point start..');
        this.sceneProperties = sceneProperties;
        this.pointSizeType = null;

        if (this.sceneProperties.quality === null) {
            this.sceneProperties.quality = "Squares";
        }

        this.createGuiSene();
        requestAnimationFrame(this.loop);

    }
    createGuiSene() {
        self = this;
        this.pointCountTarget = this.sceneProperties.pointLimit;
        this.pointSize = this.sceneProperties.pointSize;
        this.opacity = 1;
        this.showStats = false;
        this.showBoundingBox = false;
        this.freeze = false;
        this.useDEMCollisions = false;
        this.minNodeSize = 100;
        this.fov = this.sceneProperties.fov;

        this.setPointSizeType(this.sceneProperties.sizeType);
        this.setQuality(this.sceneProperties.quality);
        this.setMaterial(this.sceneProperties.material);

        var params = {
            "points(m)": this.pointCountTarget,
            PointSize: this.pointSize,
            "FOV": this.sceneProperties.fov,
            "opacity": this.opacity,
            "SizeType": this.sceneProperties.sizeType,
            "show octree": false,
            "Materials": this.sceneProperties.material,
            "Clip Mode": "Highlight Inside",
            "quality": this.sceneProperties.quality,
            "EDL": this.sceneProperties.useEDL,
            "skybox": false,
            "stats": this.showStats,
            "BoundingBox": this.showBoundingBox,
            "DEM Collisions": this.useDEMCollisions,
            "MinNodeSize": this.minNodeSize,
            "freeze": this.freeze
        };

        this.gui = new dat.gui.GUI({
            autoPlace: false,
            height: 5 * 32 - 1
        });

        this.gui.domElement.id = 'gui';
        var customContainer = document.getElementById('controlarea');
        customContainer.appendChild(this.gui.domElement);

        var pPoints = this.gui.add(params, 'points(m)', 0, 4).onChange(function(value) {
            console.log('pPoints ' + value);
            self.pointCountTarget = value;
        });

        var fAppearance = this.gui.addFolder('Appearance');

        var pPointSize = fAppearance.add(params, 'PointSize', 0, 3).onChange(function(value) {
            self.pointSize = value;
        });

        var fFOV = fAppearance.add(params, 'FOV', 20, 100).onChange(function(value) {
            self.fov = value;
        });

        var pOpacity = fAppearance.add(params, 'opacity', 0, 1).onChange(function(value) {
            self.opacity = value;
        });

        var pSizeType = fAppearance.add(params, 'SizeType', ["Fixed", "Attenuated", "Adaptive"]).onChange(function(value) {
            console.log('pSizeType ' + value);
            self.setPointSizeType(value);
        });

        var options = [];
        //attributes

        var pMaterial = fAppearance.add(params, 'Materials', options).onChange(function(value) {
            console.log('pMaterial ' + value);
            self.setMaterial(value);
        });

        var qualityOptions = ["Squares", "Circles"];

        //add code potree bugs

        var pQuality = fAppearance.add(params, 'quality', qualityOptions).onChange(function(value) {
            console.log('pQuality ' + value);
            self.quality = value;
        });

        var pSykbox = fAppearance.add(params, 'skybox').onChange(function(value) {
            self.showSkybox = value;
        });

        var fSettings = this.gui.addFolder('Settings');

        var pClipMode = fSettings.add(params, 'Clip Mode', ["No Clipping", "Clip Outside", "Highlight Inside"]).onChange(function(value) {
            console.log('pClipMode ' + value);
            if (value === "No Clipping") {
                self.clipMode = Potree.ClipMode.DISABLED;
            } else if (value === "Clip Outside") {
                self.clipMode = Potree.ClipMode.CLIP_OUTSIDE;
            } else if (value === "Highlight Inside") {
                self.clipMode = Potree.ClipMode.HIGHLIGHT_INSIDE;
            }
        });

        var pDEMCollisions = fSettings.add(params, 'DEM Collisions').onChange(function(value) {
            console.log('pDEMCollisions ' + value);
            self.useDEMCollisions = value;
        });

        var pMinNodeSize = fSettings.add(params, 'MinNodeSize', 0, 1500).onChange(function(value) {
            console.log('pDEMCollisions ' + value);
            self.minNodeSize = value;
        });

        var fDebug = this.gui.addFolder('Debug');
        var pStats = fDebug.add(params, 'stats').onChange(function(value) {
            console.log('pStats ' + value);
            self.showStats = value;
        });

        var pBoundingBox = fDebug.add(params, 'BoundingBox').onChange(function(value) {
            console.log('pStats ' + value);
            self.showBoundingBox = value;
        });

        var pFreeze = fDebug.add(params, 'freeze').onChange(function(value) {
            console.log('pStats ' + value);
            self.freeze = value;
        });

        // stats
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.stats.domElement.style.margin = '5px';
        document.body.appendChild(this.stats.domElement);

    }
    createGui() {
        var obj = {
            message: 'Hello World',
            displayOutline: true,
            maxSize: 6.0,
            speed: 5,
            height: 10,
            noiseStrength: 10.2,
            growthSpeed: 0.2,
            type: 'three',
            explode: function() {
                alert('Bang!');
            },
            color0: "#ffae23",
            color1: [0, 128, 255],
            color2: [0, 128, 255, 0.3],
            color3: { h: 350, s: 0.9, v: 0.3 }
        };

        this.gui = new dat.gui.GUI({
            autoPlace: false,
            height: 5 * 32 - 1
        });

        this.gui.domElement.id = 'gui';
        var customContainer = document.getElementById('controlarea');
        customContainer.appendChild(this.gui.domElement);
        this.gui.remember(obj);

        this.gui.add(obj, 'message');
        this.gui.add(obj, 'displayOutline');
        this.gui.add(obj, 'explode');
        this.gui.add(obj, 'maxSize').min(-10).max(10).step(0.25);
        this.gui.add(obj, 'height').step(5);
        // Choose from accepted values
        this.gui.add(obj, 'type', ['one', 'two', 'three']);
        // Choose from named values
        this.gui.add(obj, 'speed', { Stopped: 0, Slow: 0.1, Fast: 5 });
        var f1 = this.gui.addFolder('Colors');
        f1.addColor(obj, 'color0');
        f1.addColor(obj, 'color1');
        f1.addColor(obj, 'color2');
        f1.addColor(obj, 'color3');
        var f2 = this.gui.addFolder('Another Folder');
        f2.add(obj, 'noiseStrength');
        var f3 = f2.addFolder('Nested Folder');
        f3.add(obj, 'growthSpeed');
    }
    setPointSizeType(value) {
        console.log('setPointSizeType ' + value);
        if (value === "Fixed") {
            this.pointSizeType = Potree.PointSizeType.FIXED;
        } else if (value === "Attenuated") {
            this.pointSizeType = Potree.PointSizeType.ATTENUATED;
        } else if (value === "Adaptive") {
            this.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        }
    }
    setQuality(value) {
        console.log('setQuality ' + value);
        if (value == "Interpolation" && !Potree.Features.SHADER_INTERPOLATION.isSupported()) {
            this.quality = "Squares";
        } else if (value == "Splats" && !Potree.Features.SHADER_SPLATS.isSupported()) {
            this.quality = "Squares";
        } else {
            this.quality = value;
        }
    }
    setMaterial(value) {
        console.log('setMaterial ' + value);
        if (value === "RGB") {
            this.pointColorType = Potree.PointColorType.RGB;
        } else if (value === "Color") {
            this.pointColorType = Potree.PointColorType.COLOR;
        } else if (value === "Elevation") {
            this.pointColorType = Potree.PointColorType.HEIGHT;
        } else if (value === "Intensity") {
            this.pointColorType = Potree.PointColorType.INTENSITY;
        } else if (value === "Intensity Gradient") {
            this.pointColorType = Potree.PointColorType.INTENSITY_GRADIENT;
        } else if (value === "Classification") {
            this.pointColorType = Potree.PointColorType.CLASSIFICATION;
        } else if (value === "Return Number") {
            this.pointColorType = Potree.PointColorType.RETURN_NUMBER;
        } else if (value === "Source") {
            this.pointColorType = Potree.PointColorType.SOURCE;
        } else if (value === "Tree Depth") {
            this.pointColorType = Potree.PointColorType.TREE_DEPTH;
        } else if (value === "Point Index") {
            this.pointColorType = Potree.PointColorType.POINT_INDEX;
        } else if (value === "Normal") {
            this.pointColorType = Potree.PointColorType.NORMAL;
        } else if (value === "Phong") {
            this.pointColorType = Potree.PointColorType.PHONG;
        }
    }
    loop() {
        console.log('loop call');
    }
}

CloudPointController.$inject = ['$timeout', 'applicationService'];
export default CloudPointController;