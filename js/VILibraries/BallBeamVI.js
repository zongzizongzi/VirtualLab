/**
 * Created by Fengma on 2016/10/19.
 */

'use strict';
function BallBeamVI(domElement) {

    var _this = this;
    this.container = domElement;
    this.ctx = domElement.getContext('2d');
    this.name = 'BallBeamVI';
    this.cnText = '球杆模型';

    this.Fs = 50;
    this.PIDAngle = 0;
    this.PIDPosition = 0;
    this.limit = true;
    this.u1 = 0;
    this.u2 = 0;
    this.y1 = 0;
    this.y2 = 0;

    this.dataLength = 1024;
    this.index = 0;
    this.angelOutput = [];
    this.positionOutput = [];
    this.autoSave = true;

    //虚拟仪器中相连接的控件VI
    this.source = [];
    this.target = [];
    /**
     *
     * @param angle 输入端口读取角度
     */
    this.setInputAngle = function (angle) {

        if (isNaN(angle)) {

            return;
        }

        var u, v, Ts = 1 / _this.Fs, angleMax = 100 * Ts;
        u = angle;
        if (_this.limit) {
            if ((u - _this.PIDAngle) > angleMax) {

                u = _this.PIDAngle + angleMax;
            }
            if ((_this.PIDAngle - u) > angleMax) {

                u = _this.PIDAngle - angleMax;
            }
            if (u > 30) {

                u = 30;
            }
            if (u < -30) {

                u = -30;
            }
        }

        _this.PIDAngle = u;//向输出端口上写数据
        v = _this.y1 + 0.5 * Ts * (u + _this.u1);
        _this.u1 = u;
        _this.y1 = v;
        u = v;
        v = _this.y2 + 0.5 * Ts * (u + _this.u2);
        _this.u2 = u;
        _this.y2 = v;
        _this.PIDPosition = v;//向输出端口上写数据

        if (_this.autoSave) {

            _this.dataCollector(_this.PIDAngle, _this.PIDPosition);
        }

        return [_this.PIDAngle, _this.PIDPosition];
    };

    /**
     * 将输出数保存在数组内
     * @param angel 输出角度
     * @param position 输出位置
     */
    this.dataCollector = function (angel, position) {

        var i = 0;
        if (_this.index == 0) {
            for (i = 0; i < _this.dataLength - 1; i++) {
                _this.angelOutput[i] = 0;
                _this.positionOutput[i] = 0;
            }
        }
        if (_this.index <= (_this.dataLength - 1)) {
            _this.angelOutput[_this.index] = angel;
            _this.positionOutput[_this.index] = position;
            _this.index++;
        } else {
            for (i = 0; i < _this.dataLength - 1; i++) {
                _this.angelOutput[i] = _this.angelOutput[i + 1];
                _this.positionOutput[i] = _this.positionOutput[i + 1];
            }
            _this.angelOutput[_this.dataLength - 1] = angel;
            _this.positionOutput[_this.dataLength - 1] = position;
        }
    };

    this.reset = function () {

        _this.angle = 0;
        _this.position = 0;
        _this.limit = true;
        _this.u1 = 0;
        _this.u2 = 0;
        _this.y1 = 0;
        _this.y2 = 0;
        _this.index = 0;
    };

    this.draw = function () {
        var img = new Image();
        img.src = 'img/BallBeam.png';
        img.onload = function () {

            _this.ctx.drawImage(img, 0, 0, _this.container.width, _this.container.height);
        };
    };

    this.draw();


    var camera, scene, renderer, controls, markControl, switchControl, resetControl,
        beam, ball, mark, offButton, onButton, resetButton,
        position = 0;

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    /**
     * 三维绘图
     * @param domElement HTML CANVAS
     * @param loadingDiv 三维加载时遮罩
     * @constructor
     */
    this.BallBeamDraw = function (domElement, loadingDiv) {

        renderer = new THREE.WebGLRenderer({
            canvas: domElement,
            antialias: true
        });
        renderer.setClearColor(0x6495ED);
        renderer.setSize(domElement.clientWidth, domElement.clientHeight);

        camera = new THREE.PerspectiveCamera(30, domElement.clientWidth / domElement.clientHeight, 1, 100000);
        camera.position.z = 400;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.8;
        controls.enableZoom = true;
        controls.zoomSpeed = 1.2;
        controls.enableDamping = true;
//        controls.minPolarAngle = Math.PI / 4;
//        controls.maxPolarAngle = Math.PI * 3 / 4;
//        controls.minAzimuthAngle = -Math.PI / 4;
//        controls.maxAzimuthAngle = Math.PI / 4;

        scene = new THREE.Scene();


        var light = new THREE.AmbientLight(0x555555);
        scene.add(light);
        var light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(4000, 4000, 4000);
        scene.add(light1);
        var light2 = new THREE.DirectionalLight(0xffffff, 1);
        light2.position.set(-4000, 4000, -4000);
        scene.add(light2);

//use as a reference plane for ObjectControl
        var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 400));

        //标记拖动控制
        markControl = new ObjectControls(camera, renderer.domElement);
        markControl.map = plane;
        markControl.offsetUse = true;

        markControl.attachEvent('mouseOver', function () {

            this.container.style.cursor = 'pointer';
        });

        markControl.attachEvent('mouseOut', function () {

            this.container.style.cursor = 'auto';
        });

        markControl.attachEvent('dragAndDrop', onBallBeamDrag);

        markControl.attachEvent('mouseUp', function () {

            controls.enabled = true;
            this.container.style.cursor = 'auto';
        });

        //开关控制
        switchControl = new ObjectControls(camera, renderer.domElement);
        switchControl.map = plane;
        switchControl.offsetUse = true;

        switchControl.attachEvent('mouseOver', function () {

            this.container.style.cursor = 'pointer';
        });

        switchControl.attachEvent('mouseOut', function () {

            this.container.style.cursor = 'auto';
        });

        var isStart = false;
        switchControl.attachEvent('onclick', function () {

            if (!isStart) {

                isStart = !isStart;

                scene.remove(offButton);
                switchControl.detach(offButton);
                scene.add(onButton);
                switchControl.attach(onButton);

            }

            else {

                isStart = !isStart;

                scene.remove(onButton);
                switchControl.detach(onButton);
                scene.add(offButton);
                switchControl.attach(offButton);
            }

        });

        //重置开关
        resetControl = new ObjectControls(camera, renderer.domElement);
        resetControl.map = plane;
        resetControl.offsetUse = true;

        resetControl.attachEvent('mouseOver', function () {

            this.container.style.cursor = 'pointer';
        });

        resetControl.attachEvent('mouseOut', function () {

            this.container.style.cursor = 'auto';
        });

        resetControl.attachEvent('onclick', function () {

            isStart = !isStart;
            scene.remove(onButton);
            switchControl.detach(onButton);
            scene.add(offButton);
            switchControl.attach(offButton);
            position = 0;
            setPosition(0, 0);

        });

        var mtlLoader = new THREE.MTLLoader();

        var objLoader = new THREE.OBJLoader();

        if (loadingDiv) {

            loadingDiv.style.display = 'flex';
        }

        mtlLoader.load('assets/BallBeamControl/base.mtl', function (materials) {

            materials.preload();

            objLoader.setMaterials(materials);
            objLoader.load('assets/BallBeamControl/base.obj', function (base) {

                base.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {

                        child.material.side = THREE.DoubleSide;
                    }
                });
                mtlLoader.load('assets/BallBeamControl/beam.mtl', function (materials) {

                    materials.preload();

                    objLoader.setMaterials(materials);
                    objLoader.load('assets/BallBeamControl/beam.obj', function (b) {

                        b.traverse(function (child) {
                            if (child instanceof THREE.Mesh) {

                                child.material.side = THREE.DoubleSide;
                            }
                        });
                        beam = b;
                        mtlLoader.load('assets/BallBeamControl/ball.mtl', function (materials) {

                            materials.preload();

                            objLoader.setMaterials(materials);
                            objLoader.load('assets/BallBeamControl/ball.obj', function (c) {
                                c.traverse(function (child) {
                                    if (child instanceof THREE.Mesh) {

                                        child.material.side = THREE.DoubleSide;
                                    }
                                });
                                ball = c;
                                mtlLoader.load('assets/BallBeamControl/mark.mtl', function (materials) {

                                    materials.preload();

                                    objLoader.setMaterials(materials);
                                    objLoader.load('assets/BallBeamControl/mark.obj', function (d) {
                                        d.traverse(function (child) {
                                            if (child instanceof THREE.Mesh) {

                                                child.material.side = THREE.DoubleSide;
                                            }
                                        });
                                        mark = d;
                                        mtlLoader.load('assets/BallBeamControl/offButton.mtl', function (materials) {

                                            materials.preload();

                                            objLoader.setMaterials(materials);
                                            objLoader.load('assets/BallBeamControl/offButton.obj', function (e) {
                                                e.traverse(function (child) {
                                                    if (child instanceof THREE.Mesh) {

                                                        child.material.side = THREE.DoubleSide;
                                                    }
                                                });
                                                offButton = e;
                                                mtlLoader.load('assets/BallBeamControl/onButton.mtl', function (materials) {

                                                    materials.preload();

                                                    objLoader.setMaterials(materials);
                                                    objLoader.load('assets/BallBeamControl/onButton.obj', function (f) {
                                                        f.traverse(function (child) {
                                                            if (child instanceof THREE.Mesh) {

                                                                child.material.side = THREE.DoubleSide;
                                                            }
                                                        });
                                                        onButton = f;
                                                        mtlLoader.load('assets/BallBeamControl/resetButton.mtl', function (materials) {

                                                            materials.preload();

                                                            objLoader.setMaterials(materials);
                                                            objLoader.load('assets/BallBeamControl/resetButton.obj', function (g) {
                                                                g.traverse(function (child) {
                                                                    if (child instanceof THREE.Mesh) {

                                                                        child.material.side = THREE.DoubleSide;
                                                                    }
                                                                });
                                                                resetButton = g;

                                                                if (loadingDiv) {

                                                                    loadingDiv.style.display = 'none';
                                                                }

                                                                scene.add(base);
                                                                scene.add(beam);
                                                                scene.add(ball);
                                                                scene.add(mark);
                                                                scene.add(offButton);
                                                                scene.add(resetButton);
                                                                markControl.attach(mark);
                                                                switchControl.attach(offButton);
                                                                resetControl.attach(resetButton);
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        ballBeamAnimate();

        window.addEventListener('resize', function () {

            camera.aspect = domElement.clientWidth / domElement.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(domElement.clientWidth, domElement.clientHeight);
        });
    };

    function onBallBeamDrag() {

        controls.enabled = false;
        this.container.style.cursor = 'move';
        this.focused.position.y = this.previous.y;  //lock y direction
        position = this.focused.position.x;
        if (position < -120) {

            this.focused.position.x = -120;
        }
        else if (position > 120) {

            this.focused.position.x = 120;
        }

        position = this.focused.position.x;
    }

    function ballBeamAnimate() {

        window.requestAnimationFrame(ballBeamAnimate);
        markControl.update();
        controls.update();
        renderer.render(scene, camera);

    }

    function setPosition(ang, pos) {
        var angle = -ang;//角度为逆时针旋转
        beam.rotation.z = angle;
        ball.rotation.z = angle;
        mark.rotation.z = angle;
        ball.position.y = pos * Math.sin(angle);
        ball.position.x = pos * Math.cos(angle);
        mark.position.y = position * Math.sin(angle);
        mark.position.x = position * Math.cos(angle);
    }

}