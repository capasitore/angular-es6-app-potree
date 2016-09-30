import '../js/libs/three.js';

const fov = null;
const pointSize = null;
const pointCountTarget = null;
const opacity = null;
const pointSizeType = null;
const pointColorType = null;
const pointShape = Potree.PointShape.SQUARE;
const clipMode = Potree.ClipMode.HIGHLIGHT_INSIDE;
const quality = null;
const isFlipYZ = false;
const useDEMCollisions = false;
const minNodeSize = 100;
const directionalLight = null;

const showStats = false;
const showBoundingBox = false;
const freeze = false;

const fpControls = null;
const orbitControls = null;
const earthControls = null;
const controls = null;

const progressBar = new ProgressBar();

const pointcloudPath = null;

const elRenderArea = document.getElementById("renderArea");

const gui = null;
const renderer = null;
const camera = null;
const scene = null;
const scenePointCloud = null;
const sceneBG = null,
    cameraBG = null;
const pointcloud = null;
const skybox = null;
const stats = null;
const clock = new THREE.Clock();
const showSkybox = false;
const measuringTool = null;
const volumeTool = null;
const transformationTool = null;
const referenceFrame = null;
const edlRenderer = null;

class ViewerClass {
    constructor(sceneProperties) {
        this.sceneProperties = sceneProperties;
        this.pointSizeType = pointSizeType;
        this.pointCountTarget = sceneProperties.pointLimit;
        this.pointSize = sceneProperties.pointSize;
        this.fov = sceneProperties.fov;
        this.opacity = 1;

        this.pointcloudPath = sceneProperties.path;
        this.elRenderArea = document.getElementById("renderArea");
        this.pointcloud = null;
        this.useDEMCollisions = false;
        this.minNodeSize = 100;
        this.showStats = false;
        this.showBoundingBox = false;
        this.freeze = false;
        this.measuringTool = null;
        this.volumeTool = null;
        this.edlRenderer = null;

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.sceneProperties.navigation = "Orbit";
        }

        if (this.sceneProperties.quality === null) {
            this.sceneProperties.quality = "Squares";
        }

        var intensityMax = null;
        var heightMin = null;
        var heightMax = null;

        var PotreeRenderer = function() {
            this.render = function() {
                {
                    var width = self.elRenderArea.clientWidth;
                    var height = self.elRenderArea.clientHeight;
                    var aspect = width / height;
                    self.camera.aspect = aspect;
                    self.camera.updateProjectionMatrix();
                    self.renderer.setSize(width, height);
                }

                if (self.showSkybox) {
                    self.skybox.camera.rotation.copy(camera.rotation);
                    self.renderer.render(skybox.scene, skybox.camera);
                } else {
                    self.renderer.render(self.sceneBG, self.cameraBG);
                }

                if (self.pointcloud) {
                    if (self.pointcloud.originalMaterial) {
                        self.pointcloud.material = self.pointcloud.originalMaterial;
                    }
                    var bbWorld = Potree.utils.computeTransformedBoundingBox(self.pointcloud.boundingBox, self.pointcloud.matrixWorld);

                    self.pointcloud.visiblePointsTarget = self.pointCountTarget * 1000 * 1000;
                    self.pointcloud.material.size = self.pointSize;
                    self.pointcloud.material.opacity = self.opacity;
                    self.pointcloud.material.pointColorType = self.pointColorType;
                    self.pointcloud.material.pointSizeType = self.pointSizeType;
                    self.pointcloud.material.pointShape = (self.quality === "Circles") ? Potree.PointShape.CIRCLE : Potree.PointShape.SQUARE;
                    self.pointcloud.material.interpolate = (self.quality === "Interpolation");
                    self.pointcloud.material.weighted = false;
                }

                self.renderer.render(self.scene, self.camera);
                self.renderer.render(self.scenePointCloud, self.camera);
                self.profileTool.render();

                self.renderer.clearDepth();
                self.measuringTool.render();
                self.transformationTool.render();
            };
        };

        var potreeRenderer = new PotreeRenderer();
        var highQualityRenderer = null;

        var HighQualityRenderer = function() {
            var depthMaterial = null;
            var attributeMaterial = null;
            var normalizationMaterial = null;
            var rtDepth;
            var rtNormalize;

            var initHQSPlats = function() {
                if (depthMaterial != null) {
                    return;
                }
                depthMaterial = new Potree.PointCloudMaterial();
                attributeMaterial = new Potree.PointCloudMaterial();
                depthMaterial.pointColorType = Potree.PointColorType.DEPTH;
                depthMaterial.pointShape = Potree.PointShape.CIRCLE;
                depthMaterial.interpolate = false;
                depthMaterial.weighted = false;
                depthMaterial.minSize = 2;

                attributeMaterial.pointShape = Potree.PointShape.CIRCLE;
                attributeMaterial.interpolate = false;
                attributeMaterial.weighted = true;
                attributeMaterial.minSize = 2;

                rtDepth = new THREE.WebGLRenderTarget(1024, 1024, {
                    minFilter: THREE.NearestFilter,
                    magFilter: THREE.NearestFilter,
                    format: THREE.RGBAFormat,
                    type: THREE.FloatType
                });

                rtNormalize = new THREE.WebGLRenderTarget(1024, 1024, {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.NearestFilter,
                    format: THREE.RGBAFormat,
                    type: THREE.FloatType
                });

                var uniformsNormalize = {
                    depthMap: { type: "t", value: rtDepth },
                    texture: { type: "t", value: rtNormalize }
                };

                normalizationMaterial = new THREE.ShaderMaterial({
                    uniforms: uniformsNormalize,
                    vertexShader: Potree.Shaders["normalize.vs"],
                    fragmentShader: Potree.Shaders["normalize.fs"]
                });
            }

            var resize = function(width, height) {
                if (rtDepth.width == width && rtDepth.height == height) {
                    return;
                }

                rtDepth.dispose();
                rtNormalize.dispose();

                camera.aspect = width / height;
                camera.updateProjectionMatrix();

                renderer.setSize(width, height);
                rtDepth.setSize(width, height);
                rtNormalize.setSize(width, height);
            };

            this.render = function(renderer) {

                var width = elRenderArea.clientWidth;
                var height = elRenderArea.clientHeight;

                initHQSPlats();

                resize(width, height);


                renderer.clear();
                if (showSkybox) {
                    skybox.camera.rotation.copy(camera.rotation);
                    renderer.render(skybox.scene, skybox.camera);
                } else {
                    renderer.render(sceneBG, cameraBG);
                }
                renderer.render(scene, camera);

                if (pointcloud) {
                    depthMaterial.uniforms.octreeSize.value = pointcloud.pcoGeometry.boundingBox.size().x;
                    attributeMaterial.uniforms.octreeSize.value = pointcloud.pcoGeometry.boundingBox.size().x;
                    pointcloud.visiblePointsTarget = pointCountTarget * 1000 * 1000;
                    var originalMaterial = pointcloud.material;

                    {
                        depthMaterial.size = pointSize;
                        depthMaterial.pointSizeType = pointSizeType;
                        depthMaterial.screenWidth = width;
                        depthMaterial.screenHeight = height;
                        depthMaterial.uniforms.visibleNodes.value = pointcloud.material.visibleNodesTexture;
                        depthMaterial.uniforms.octreeSize.value = pointcloud.pcoGeometry.boundingBox.size().x;
                        depthMaterial.fov = camera.fov * (Math.PI / 180);
                        depthMaterial.spacing = pointcloud.pcoGeometry.spacing;
                        depthMaterial.near = camera.near;
                        depthMaterial.far = camera.far;
                        depthMaterial.heightMin = heightMin;
                        depthMaterial.heightMax = heightMax;
                        depthMaterial.uniforms.visibleNodes.value = pointcloud.material.visibleNodesTexture;
                        depthMaterial.uniforms.octreeSize.value = pointcloud.pcoGeometry.boundingBox.size().x;
                        depthMaterial.bbSize = pointcloud.material.bbSize;
                        depthMaterial.treeType = pointcloud.material.treeType;

                        scenePointCloud.overrideMaterial = depthMaterial;
                        renderer.clearTarget(rtDepth, true, true, true);
                        renderer.render(scenePointCloud, camera, rtDepth);
                        scenePointCloud.overrideMaterial = null;
                    }

                    {
                        attributeMaterial.size = pointSize;
                        attributeMaterial.pointSizeType = pointSizeType;
                        attributeMaterial.screenWidth = width;
                        attributeMaterial.screenHeight = height;
                        attributeMaterial.pointColorType = pointColorType;
                        attributeMaterial.depthMap = rtDepth;
                        attributeMaterial.uniforms.visibleNodes.value = pointcloud.material.visibleNodesTexture;
                        attributeMaterial.uniforms.octreeSize.value = pointcloud.pcoGeometry.boundingBox.size().x;
                        attributeMaterial.fov = camera.fov * (Math.PI / 180);
                        attributeMaterial.spacing = pointcloud.pcoGeometry.spacing;
                        attributeMaterial.near = camera.near;
                        attributeMaterial.far = camera.far;
                        attributeMaterial.heightMin = heightMin;
                        attributeMaterial.heightMax = heightMax;
                        attributeMaterial.intensityMin = pointcloud.material.intensityMin;
                        attributeMaterial.intensityMax = pointcloud.material.intensityMax;
                        attributeMaterial.setClipBoxes(pointcloud.material.clipBoxes);
                        attributeMaterial.clipMode = pointcloud.material.clipMode;
                        attributeMaterial.bbSize = pointcloud.material.bbSize;
                        attributeMaterial.treeType = pointcloud.material.treeType;

                        scenePointCloud.overrideMaterial = attributeMaterial;
                        renderer.clearTarget(rtNormalize, true, true, true);
                        renderer.render(scenePointCloud, camera, rtNormalize);
                        scenePointCloud.overrideMaterial = null;
                    }

                    {
                        normalizationMaterial.uniforms.depthMap.value = rtDepth;
                        normalizationMaterial.uniforms.texture.value = rtNormalize;
                        Potree.utils.screenPass.render(renderer, normalizationMaterial);
                    }

                    pointcloud.material = originalMaterial;

                    volumeTool.render();
                    renderer.clearDepth();
                    profileTool.render();
                    measuringTool.render();
                    transformationTool.render();
                }
            }
        };


    }
    setPointSizeType(value) {
        if (value === "Fixed") {
            this.pointSizeType = Potree.PointSizeType.FIXED;
        } else if (value === "Attenuated") {
            this.pointSizeType = Potree.PointSizeType.ATTENUATED;
        } else if (value === "Adaptive") {
            this.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        }
    }
    setQuality(value) {
        if (value == "Interpolation" && !Potree.Features.SHADER_INTERPOLATION.isSupported()) {
            this.quality = "Squares";
        } else if (value == "Splats" && !Potree.Features.SHADER_SPLATS.isSupported()) {
            this.quality = "Squares";
        } else {
            this.quality = value;
        }
    }
    setMaterial(value) {
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
    initGUI() {
        this.setPointSizeType(this.sceneProperties.sizeType);
        this.setQuality(this.sceneProperties.quality);
        this.setMaterial(this.sceneProperties.material);
        const self = this;

        var params = function() {
            this.points = self.pointCountTarget;
            this.PointSize = self.pointSize;
            this.FOV = self.sceneProperties.fov;
            this.opacity = self.opacity;
            this.SizeType = self.sceneProperties.sizeType;
            this.showoctree = false;
            this.Materials = self.sceneProperties.material;
            this.ClipMode = "Highlight Inside";
            this.quality = self.sceneProperties.quality;
            this.EDL = self.sceneProperties.useEDL;
            this.skybox = false;
            this.stats = self.showStats;
            this.BoundingBox = self.showBoundingBox;
            this.DEMCollisions = self.useDEMCollisions;
            this.MinNodeSize = self.minNodeSize;
            this.freeze = self.freeze;
        };

        var data = new params();
        var gui = new dat.GUI();

        var pPoints = gui.add(data, 'points', 0, 4).onChange(function(value) {
            self.pointCountTarget = value;
        });

        var fAppearance = gui.addFolder('Appearance');

        var pPointSize = fAppearance.add(data, 'PointSize', 0, 3).onChange(function(value) {
            self.pointSize = value;
        });

        var fFOV = fAppearance.add(data, 'FOV', 20, 100).onChange(function(value) {
            self.fov = value;
        });

        var pOpacity = fAppearance.add(data, 'opacity', 0, 1).onChange(function(value) {
            self.opacity = value;
        });

        var pSizeType = fAppearance.add(data, 'SizeType', ["Fixed", "Attenuated", "Adaptive"]).onChange(function(value) {
            self.setPointSizeType(value);
        });

        var options = [];
        var attributes = self.pointcloud.pcoGeometry.pointAttributes;
        if (attributes === "LAS" || attributes === "LAZ") {
            options = [
                "RGB", "Color", "Elevation", "Intensity", "Intensity Gradient",
                "Classification", "Return Number", "Source",
                "Tree Depth"
            ];
        } else {
            for (var i = 0; i < attributes.attributes.length; i++) {
                var attribute = attributes.attributes[i];
                if (attribute === Potree.PointAttribute.COLOR_PACKED) {
                    options.push("RGB");
                } else if (attribute === Potree.PointAttribute.INTENSITY) {
                    options.push("Intensity");
                    options.push("Intensity Gradient");
                } else if (attribute === Potree.PointAttribute.CLASSIFICATION) {
                    options.push("Classification");
                }
            }
            if (attributes.hasNormals()) {
                options.push("Phong");
                options.push("Normal");
            }
            options.push("Elevation");
            options.push("Color");
            options.push("Tree Depth");
        }

        if (options.indexOf(data.Materials) < 0) {
            console.error("Default Material '" + data.Materials + "' is not available. Using Elevation instead");
            setMaterial("Elevation");
            data.Materials = "Elevation";
        }

        var pMaterial = fAppearance.add(data, 'Materials', options).onChange(function(value) {
            setMaterial(value);
        });

        var qualityOptions = ["Squares", "Circles"];

        if (Potree.Features.SHADER_INTERPOLATION.isSupported()) {
            qualityOptions.push("Interpolation");
        }

        if (Potree.Features.SHADER_SPLATS.isSupported()) {
            qualityOptions.push("Splats");
        }

        var pQuality = fAppearance.add(data, 'quality', qualityOptions).onChange(function(value) {
            self.quality = value;
        });

        if (Potree.Features.SHADER_EDL.isSupported()) {
            var pEDL = fAppearance.add(data, 'EDL').onChange(function(value) {
                self.sceneProperties.useEDL = value;
            });
        }

        var pSykbox = fAppearance.add(data, 'skybox').onChange(function(value) {
            self.showSkybox = value;
        });

        var fSettings = gui.addFolder('Settings');
        var pClipMode = fSettings.add(data, 'ClipMode', ["No Clipping", "Clip Outside", "Highlight Inside"]).onChange(function(value) {
            if (value === "No Clipping") {
                self.clipMode = Potree.ClipMode.DISABLED;
            } else if (value === "Clip Outside") {
                self.clipMode = Potree.ClipMode.CLIP_OUTSIDE;
            } else if (value === "Highlight Inside") {
                self.clipMode = Potree.ClipMode.HIGHLIGHT_INSIDE;
            }
        });

        var pDEMCollisions = fSettings.add(data, 'DEMCollisions').onChange(function(value) {
            self.useDEMCollisions = value;
        });

        var pMinNodeSize = fSettings.add(data, 'MinNodeSize', 0, 1500).onChange(function(value) {
            self.minNodeSize = value;
        });

        var fDebug = gui.addFolder('Debug');
        var pStats = fDebug.add(data, 'stats').onChange(function(value) {
            self.showStats = value;
        });

        var pBoundingBox = fDebug.add(data, 'BoundingBox').onChange(function(value) {
            self.showBoundingBox = value;
        });

        var pFreeze = fDebug.add(data, 'freeze').onChange(function(value) {
            self.freeze = value;
        });

        self.stats = new Stats();
        self.stats.domElement.style.position = 'absolute';
        self.stats.domElement.style.top = '0px';
        self.stats.domElement.style.margin = '5px';
        document.body.appendChild(self.stats.domElement);
    }
    initThree() {
        const self = this;
        var width = this.elRenderArea.clientWidth;
        var height = this.elRenderArea.clientHeight;
        var aspect = width / height;
        var near = 0.1;
        var far = 1000 * 1000;

        this.scene = new THREE.Scene();
        this.scenePointCloud = new THREE.Scene();
        this.sceneBG = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(this.fov, aspect, near, far);
        this.cameraBG = new THREE.Camera();
        this.camera.rotation.order = 'ZYX';

        this.referenceFrame = new THREE.Object3D();
        this.scenePointCloud.add(this.referenceFrame);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.autoClear = false;
        this.elRenderArea.appendChild(this.renderer.domElement);

        this.skybox = Potree.utils.loadSkybox("potree/resources/textures/skybox/");

        this.camera.position.set(-304, 372, 318);
        this.camera.rotation.y = -Math.PI / 4;
        this.camera.rotation.x = -Math.PI / 6;

        this.earthControls = new THREE.EarthControls(this.camera, this.renderer, this.scenePointCloud);

        this.earthControls.addEventListener("proposeTransform", function(event) {
            if (!self.pointcloud || !self.useDEMCollisions) {
                return;
            }
            var demHeight = self.pointcloud.getDEMHeight(event.newPosition);
            if (event.newPosition.y < demHeight) {
                event.objections++;
            }
        });

        this.useEarthControls();

        this.renderer.context.getExtension("EXT_frag_depth");
        if (!this.pointcloudPath) {

        } else if (this.pointcloudPath.indexOf("cloud.js") > 0) {
            Potree.POCLoader.load(self.pointcloudPath, function(geometry) {
                self.pointcloud = new Potree.PointCloudOctree(geometry);
                self.pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
                self.pointcloud.material.size = self.pointSize;
                self.pointcloud.visiblePointsTarget = self.pointCountTarget * 1000 * 1000;
                self.referenceFrame.add(self.pointcloud);

                self.referenceFrame.updateMatrixWorld(true);
                var sg = self.pointcloud.boundingSphere.clone().applyMatrix4(self.pointcloud.matrixWorld);

                self.referenceFrame.position.copy(sg.center).multiplyScalar(-1);
                self.referenceFrame.updateMatrixWorld(true);

                if (sg.radius > 50 * 1000) {
                    self.camera.near = 10;
                } else if (sg.radius > 10 * 1000) {
                    self.camera.near = 2;
                } else if (sg.radius > 1000) {
                    self.camera.near = 1;
                } else if (sg.radius > 100) {
                    self.camera.near = 0.5;
                } else {
                    self.camera.near = 0.1;
                }

                self.flipYZ();
                self.camera.zoomTo(self.pointcloud, 1);
                self.initGUI();
                self.earthControls.pointclouds.push(self.pointcloud);

                if (self.sceneProperties.navigation === "Earth") {
                    self.useEarthControls();
                } else if (self.sceneProperties.navigation === "Orbit") {
                    self.useOrbitControls();
                } else if (self.sceneProperties.navigation === "Flight") {
                    self.useFPSControls();
                } else {
                    console.warning("No navigation mode specified. Using OrbitControls");
                    self.useOrbitControls();
                }
                if (self.sceneProperties.cameraPosition != null) {
                    var cp = new THREE.Vector3(self.sceneProperties.cameraPosition[0],
                        self.sceneProperties.cameraPosition[1], self.sceneProperties.cameraPosition[2]);
                    self.camera.position.copy(cp);
                }
                if (self.sceneProperties.cameraTarget != null) {
                    var ct = new THREE.Vector3(self.sceneProperties.cameraTarget[0],
                        self.sceneProperties.cameraTarget[1], self.sceneProperties.cameraTarget[2]);
                    self.camera.lookAt(ct);
                    if (self.sceneProperties.navigation === "Orbit") {
                        self.controls.target.copy(ct);
                    }
                }
            });
        } else if (this.pointcloudPath.indexOf(".vpc") > 0) {
            Potree.PointCloudArena4DGeometry.load(this.pointcloudPath, function(geometry) {
                self.pointcloud = new Potree.PointCloudArena4D(geometry);
                self.pointcloud.visiblePointsTarget = 500 * 1000;
                self.referenceFrame.add(pointcloud);
                self.flipYZ();

                self.referenceFrame.updateMatrixWorld(true);
                var sg = self.pointcloud.boundingSphere.clone().applyMatrix4(self.pointcloud.matrixWorld);

                self.referenceFrame.position.sub(sg.center);
                self.referenceFrame.position.y += sg.radius / 2;
                self.referenceFrame.updateMatrixWorld(true);

                self.camera.zoomTo(pointcloud, 1);

                self.sinitGUI();
                self.pointcloud.material.interpolation = false;
                self.pointcloud.material.pointSizeType = Potree.PointSizeType.ATTENUATED;
                self.searthControls.pointclouds.push(self.pointcloud);

                if (self.sceneProperties.navigation === "Earth") {
                    self.useEarthControls();
                } else if (self.sceneProperties.navigation === "Orbit") {
                    self.useOrbitControls();
                } else if (self.sceneProperties.navigation === "Flight") {
                    self.useFPSControls();
                } else {
                    console.warning("No navigation mode specivied. Using OrbitControls");
                    self.useOrbitControls();
                }

                if (self.sceneProperties.cameraPosition != null) {
                    var cp = new THREE.Vector3(self.sceneProperties.cameraPosition[0],
                        self.sceneProperties.cameraPosition[1], self.sceneProperties.cameraPosition[2]);
                    self.camera.position.copy(cp);
                }

                if (self.sceneProperties.cameraTarget != null) {
                    var ct = new THREE.Vector3(self.sceneProperties.cameraTarget[0],
                        self.sceneProperties.cameraTarget[1], self.sceneProperties.cameraTarget[2]);
                    self.camera.lookAt(ct);
                }
            });
        }
        var grid = Potree.utils.createGrid(5, 5, 2);
        self.scene.add(grid);

        self.measuringTool = new Potree.MeasuringTool(self.scenePointCloud, self.camera, self.renderer);
        self.profileTool = new Potree.ProfileTool(self.scenePointCloud, self.camera, self.renderer);
        self.volumeTool = new Potree.VolumeTool(self.scenePointCloud, self.camera, self.renderer);
        self.transformationTool = new Potree.TransformationTool(self.scenePointCloud, self.camera, self.renderer);

        var texture = Potree.utils.createBackgroundTexture(512, 512);

        texture.minFilter = texture.magFilter = THREE.NearestFilter;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;

        var bg = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2, 2, 0),
            new THREE.MeshBasicMaterial({
                map: texture
            })
        );
        bg.material.depthTest = false;
        bg.material.depthWrite = false;
        self.sceneBG.add(bg);

        window.addEventListener('keydown', self.onKeyDown, false);

        self.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        self.directionalLight.position.set(10, 10, 10);
        self.directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
        self.scenePointCloud.add(self.directionalLight);

        var light = new THREE.AmbientLight(0x555555); // soft white light
        self.scenePointCloud.add(light);
    }
    flipYZ() {
        this.isFlipYZ = !this.isFlipYZ;
        if (this.isFlipYZ) {
            this.referenceFrame.matrix.copy(new THREE.Matrix4());
            this.referenceFrame.applyMatrix(new THREE.Matrix4().set(
                1, 0, 0, 0,
                0, 0, 1, 0,
                0, -1, 0, 0,
                0, 0, 0, 1
            ));
        } else {
            this.referenceFrame.matrix.copy(new THREE.Matrix4());
            this.referenceFrame.applyMatrix(new THREE.Matrix4().set(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ));
        }
        this.referenceFrame.updateMatrixWorld(true);
        this.pointcloud.updateMatrixWorld();
        var sg = this.pointcloud.boundingSphere.clone().applyMatrix4(this.pointcloud.matrixWorld);
        this.referenceFrame.position.copy(sg.center).multiplyScalar(-1);
        this.referenceFrame.updateMatrixWorld(true);
        this.referenceFrame.position.y -= this.pointcloud.getWorldPosition().y;
        this.referenceFrame.updateMatrixWorld(true);
    }
    useEarthControls() {
        if (this.controls) {
            this.controls.enabled = false;
        }
        this.controls = this.earthControls;
        this.controls.enabled = true;
    }
    useOrbitControls() {
        if (this.controls) {
            this.controls.enabled = false;
        }
        if (!this.orbitControls) {
            this.orbitControls = new Potree.OrbitControls(this.camera, this.renderer.domElement);
            this.orbitControls.addEventListener("proposeTransform", function(event) {
                if (!this.pointcloud || !this.useDEMCollisions) {
                    return;
                }
                var demHeight = this.pointcloud.getDEMHeight(event.newPosition);
                if (event.newPosition.y < demHeight) {
                    event.objections++;
                    var counterProposal = event.newPosition.clone();
                    counterProposal.y = demHeight;
                    event.counterProposals.push(counterProposal);
                }
            });
        }
        this.controls = this.orbitControls;
        this.controls.enabled = true;
        if (this.pointcloud) {
            this.controls.target.copy(this.pointcloud.boundingSphere.center.clone().applyMatrix4(this.pointcloud.matrixWorld));
        }
    }
    useFPSControls() {
        if (this.controls) {
            this.controls.enabled = false;
        }
        if (!this.fpControls) {
            this.fpControls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement)
                .addEventListener("proposeTransform", function(event) {
                    if (!self.pointcloud || !self.useDEMCollisions) {
                        return;
                    }
                    var demHeight = self.pointcloud.getDEMHeight(event.newPosition);
                    if (event.newPosition.y < demHeight) {
                        event.objections++;
                        var counterProposal = event.newPosition.clone();
                        counterProposal.y = demHeight;
                        event.counterProposals.push(counterProposal);
                    }
                });
        }
        this.controls = this.fpControls;
        this.controls.enabled = true;
        this.scontrols.moveSpeed = this.pointcloud.boundingSphere.radius / 6;
    }
    onKeyDown(event) {
        if (event.keyCode === 69) {
            self.transformationTool.translate();
        } else if (event.keyCode === 82) {
            self.transformationTool.scale();
        } else if (event.keyCode === 84) {
            self.transformationTool.rotate();
        }
    }

    update() {
        Potree.pointLoadLimit = this.pointCountTarget * 2 * 1000 * 1000;
        console.log(this.directionalLight);
        this.directionalLight.position.copy(this.camera.position);


        this.directionalLight.lookAt(new THREE.Vector3().addVectors(
            this.camera.position, this.camera.getWorldDirection()));

        if (this.pointcloud) {
            var bbWorld = Potree.utils.computeTransformedBoundingBox(this.pointcloud.boundingBox, this.pointcloud.matrixWorld);
            if (!intensityMax) {
                var root = this.pointcloud.pcoGeometry.root;
                if (root != null && root.loaded) {
                    var attributes = self.pointcloud.pcoGeometry.root.geometry.attributes;
                    if (attributes.intensity) {
                        var array = attributes.intensity.array;
                        var max = 0;
                        for (var i = 0; i < array.length; i++) {
                            max = Math.max(array[i]);
                        }
                        if (max <= 1) {
                            this.intensityMax = 1;
                        } else if (max <= 256) {
                            this.intensityMax = 255;
                        } else {
                            this.intensityMax = max;
                        }
                    }
                }
            }

            if (this.heightMin === null) {
                this.heightMin = bbWorld.min.y;
                this.heightMax = bbWorld.max.y;
            }

            this.pointcloud.material.clipMode = clipMode;
            this.pointcloud.material.heightMin = heightMin;
            this.pointcloud.material.heightMax = heightMax;
            this.pointcloud.material.intensityMin = 0;
            this.pointcloud.material.intensityMax = intensityMax;
            this.pointcloud.showBoundingBox = showBoundingBox;
            this.pointcloud.generateDEM = useDEMCollisions;
            this.pointcloud.minimumNodePixelSize = minNodeSize;

            if (!this.freeze) {
                this.pointcloud.update(this.camera, this.renderer);
            }
        }
        if (this.stats && this.showStats) {
            document.getElementById("lblNumVisibleNodes").style.display = "";
            document.getElementById("lblNumVisiblePoints").style.display = "";
            this.stats.domElement.style.display = "";
            this.stats.update();
            if (this.pointcloud) {
                document.getElementById("lblNumVisibleNodes").innerHTML = "visible nodes: " + this.pointcloud.numVisibleNodes;
                document.getElementById("lblNumVisiblePoints").innerHTML = "visible points: " + Potree.utils.addCommas(this.pointcloud.numVisiblePoints);
            }
        } else if (this.stats) {
            document.getElementById("lblNumVisibleNodes").style.display = "none";
            document.getElementById("lblNumVisiblePoints").style.display = "none";
            this.stats.domElement.style.display = "none";
        }
        this.camera.fov = this.fov;
        if (this.controls) {
            this.controls.update(clock.getDelta());
        }
        if (this.pointcloud) {
            var progress = self.pointcloud.progress;
            console.log('progress ' + progress);
            self.progressBar.progress = progress;

            var message;
            if (progress === 0 || pointcloud instanceof Potree.PointCloudArena4D) {
                message = "loading";
            } else {
                message = "loading: " + parseInt(progress * 100) + "%";
            }
            progressBar.message = message;

            if (progress === 1) {
                progressBar.hide();
            } else if (progress < 1) {
                progressBar.show();
            }
        }
        this.volumeTool.update();
        this.transformationTool.update();
        this.profileTool.update();
        var clipBoxes = [];

        for (var i = 0; i < this.profileTool.profiles.length; i++) {
            var profile = this.profileTool.profiles[i];

            for (var j = 0; j < profile.boxes.length; j++) {
                var box = profile.boxes[j];
                box.updateMatrixWorld();
                var boxInverse = new THREE.Matrix4().getInverse(box.matrixWorld);
                clipBoxes.push(boxInverse);
            }
        }
        for (var i = 0; i < this.volumeTool.volumes.length; i++) {
            var volume = volumeTool.volumes[i];
            if (volume.clip) {
                volume.updateMatrixWorld();
                var boxInverse = new THREE.Matrix4().getInverse(volume.matrixWorld);
                clipBoxes.push(boxInverse);
            }
        }
        if (this.pointcloud) {
            this.pointcloud.material.setClipBoxes(clipBoxes);
        }
    }
    loop() {
        self = this;
        console.log('requestAnimationFrame 1');

        // requestAnimationFrame(this.loop);

        this.update();

        var EDLRenderer = function() {
            var edlMaterial = null;
            var attributeMaterial = null;
            var rtColor = null;
            var gl = self.renderer.context;

            var initEDL = function() {
                if (edlMaterial != null) {
                    return;
                }
                edlMaterial = new Potree.EyeDomeLightingMaterial();
                attributeMaterial = new Potree.PointCloudMaterial();
                attributeMaterial.pointShape = Potree.PointShape.CIRCLE;
                attributeMaterial.interpolate = false;
                attributeMaterial.weighted = false;
                attributeMaterial.minSize = 2;
                attributeMaterial.useLogarithmicDepthBuffer = false;
                attributeMaterial.useEDL = true;
                rtColor = new THREE.WebGLRenderTarget(1024, 1024, {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.NearestFilter,
                    format: THREE.RGBAFormat,
                    type: THREE.FloatType,
                });
            };

            var resize = function() {
                var width = self.elRenderArea.clientWidth;
                var height = self.elRenderArea.clientHeight;
                var aspect = width / height;
                var needsResize = (rtColor.width != width || rtColor.height != height);
                if (needsResize) {
                    rtColor.dispose();
                }
                self.camera.aspect = aspect;
                self.camera.updateProjectionMatrix();
                self.renderer.setSize(width, height);
                rtColor.setSize(width, height);
            }

            console.log('renderer pointcloud 1 ' + pointcloud);

            this.render = function() {
                initEDL();
                resize();
                self.renderer.clear();
                if (self.showSkybox) {
                    self.skybox.camera.rotation.copy(self.camera.rotation);
                    self.renderer.render(self.skybox.scene, self.skybox.camera);
                } else {
                    self.renderer.render(self.sceneBG, self.cameraBG);
                }
                self.renderer.render(self.scene, self.camera);
                console.log('renderer pointcloud ' + self.pointcloud);
                if (self.pointcloud) {
                    var width = self.elRenderArea.clientWidth;
                    var height = self.elRenderArea.clientHeight;
                    var octreeSize = self.pointcloud.pcoGeometry.boundingBox.size().x;
                    pointcloud.visiblePointsTarget = pointCountTarget * 1000 * 1000;
                    var originalMaterial = pointcloud.material;

                    {
                        attributeMaterial.size = pointSize;
                        attributeMaterial.pointSizeType = pointSizeType;
                        attributeMaterial.screenWidth = width;
                        attributeMaterial.screenHeight = height;
                        attributeMaterial.pointColorType = pointColorType;
                        attributeMaterial.uniforms.visibleNodes.value = pointcloud.material.visibleNodesTexture;
                        attributeMaterial.uniforms.octreeSize.value = octreeSize;
                        attributeMaterial.fov = camera.fov * (Math.PI / 180);
                        attributeMaterial.spacing = pointcloud.pcoGeometry.spacing;
                        attributeMaterial.near = camera.near;
                        attributeMaterial.far = camera.far;
                        attributeMaterial.heightMin = heightMin;
                        attributeMaterial.heightMax = heightMax;
                        attributeMaterial.intensityMin = pointcloud.material.intensityMin;
                        attributeMaterial.intensityMax = pointcloud.material.intensityMax;
                        attributeMaterial.setClipBoxes(pointcloud.material.clipBoxes);
                        attributeMaterial.clipMode = pointcloud.material.clipMode;
                        attributeMaterial.bbSize = pointcloud.material.bbSize;
                        attributeMaterial.treeType = pointcloud.material.treeType;
                        scenePointCloud.overrideMaterial = attributeMaterial;
                        renderer.clearTarget(rtColor, true, true, true);
                        renderer.render(scenePointCloud, camera, rtColor);
                        scenePointCloud.overrideMaterial = null;
                    } {
                        edlMaterial.uniforms.screenWidth.value = width;
                        edlMaterial.uniforms.screenHeight.value = height;
                        edlMaterial.uniforms.near.value = camera.near;
                        edlMaterial.uniforms.far.value = camera.far;
                        edlMaterial.uniforms.colorMap.value = rtColor;
                        edlMaterial.uniforms.expScale.value = camera.far;
                        Potree.utils.screenPass.render(renderer, edlMaterial);
                    }
                    renderer.render(scene, camera);
                    profileTool.render();
                    volumeTool.render();
                    renderer.clearDepth();
                    measuringTool.render();
                    transformationTool.render();
                }
            }
        };
        console.log("sceneProperties");
        if (this.sceneProperties.useEDL) {
            if (!this.edlRenderer) {
                this.edlRenderer = new EDLRenderer();
            }
            this.edlRenderer.render(renderer);
        } else if (quality === "Splats") {
            if (!highQualityRenderer) {
                highQualityRenderer = new HighQualityRenderer();
            }
            this.highQualityRenderer.render(renderer);
        } else {
            this.potreeRenderer.render();
        }

    }
}
export default ViewerClass;