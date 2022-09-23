import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import starsTexture from "../img/stars.jpg";
import sunTexture from "../img/sun.jpg";
import mercuryTexture from "../img/mercury.jpg";
import saturnTexture from "../img/saturn.jpg";
import saturnRingTexture from "../img/saturn ring.png";
import earthTexture from "../img/earth.jpg";
import jupiterTexture from "../img/jupiter.jpg";
import marsTexture from "../img/mars.jpg";
import neptuneTexture from "../img/neptune.jpg";
import plutoTexture from "../img/pluto.jpg";
import uranusTexture from "../img/uranus.jpg";
import uranusRingTexture from "../img/uranus ring.png";
import venusTexture from "../img/venus.jpg";
import galaxy1 from "../img/galaxy1.png";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { GUI } from "dat.gui";

// setup three
const renderer = new THREE.WebGLRenderer({
	// Khử răng cưa
	antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const textureLoader = new THREE.TextureLoader();

// Tạo giao diện thay đổi thông số trong js

// initial params
const params = {
	// pointLight: '#7a7a7a',
	exposure: 1,
	bloomStrength: 1.07,
	bloomThreshold: 0.23,
	bloomRadius: 0.51,
};
const gui = new GUI();

gui
	.add(params, "exposure", 0.1, 2)
	.step(0.01)
	.onChange(function (value) {
		renderer.toneMappingExposure = Math.pow(value, 4.0);
	});

gui
	.add(params, "bloomThreshold", 0.0, 2.0)
	.step(0.01)
	.onChange(function (value) {
		bloomPass.threshold = Number(value);
	});

gui
	.add(params, "bloomStrength", 0.0, 3.0)
	.step(0.01)
	.onChange(function (value) {
		bloomPass.strength = Number(value);
	});

gui
	.add(params, "bloomRadius", 0.0, 1.0)
	.step(0.01)
	.onChange(function (value) {
		bloomPass.radius = Number(value);
	});


renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
renderer.setClearColor(0x000000, 0.0);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//bloom renderer (Xử lí hậu kì)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
	new THREE.Vector2(window.innerWidth, window.innerHeight),
	1.5, //strength
	0.4, //radius
	0.85 //threshold
);
renderer.toneMappingExposure = params.exposure;
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength; //intensity of glow
bloomPass.radius = params.bloomRadius;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(400, 64, 64);

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
	map: textureLoader.load(galaxy1),
	// color: 0x333333,
	side: THREE.BackSide,
	transparent: true,
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
// set layers
// starMesh.layers.set(1);
scene.add(starMesh);

// Hiện thị trục xyz
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// cho phép camera quay xung quanh vật thể
const orbit = new OrbitControls(camera, renderer.domElement);
// Không đặt sau orbit update
camera.position.set(-90, 140, 140);
orbit.update();

//  ánh sáng chiếu đến vật thể
const ambienLight = new THREE.AmbientLight(0x333333);
scene.add(ambienLight);

// Back ground
// const cubeTextureLoader = new THREE.CubeTextureLoader();
// scene.background = cubeTextureLoader.load([
// 	starsTexture,
// 	starsTexture,
// 	starsTexture,
// 	starsTexture,
// 	starsTexture,
// 	starsTexture,
// ]);

const createPlanet = (size, texture, position, ring) => {
	const geo = new THREE.SphereGeometry(size, 30, 30);
	const mat = new THREE.MeshStandardMaterial({
		map: textureLoader.load(texture),
	});
	const mesh = new THREE.Mesh(geo, mat);
	const obj = new THREE.Object3D();
	obj.add(mesh);
	scene.add(obj);
	mesh.position.x = position;
	if (ring) {
		// Tạo ring
		const ringGeo = new THREE.RingGeometry(
			ring.innerRadius,
			ring.outerRadius,
			32
		);
		const ringMat = new THREE.MeshBasicMaterial({
			map: textureLoader.load(ring.texture),
			side: THREE.DoubleSide,
		});
		const ringMesh = new THREE.Mesh(ringGeo, ringMat);
		obj.add(ringMesh);
		ringMesh.position.x = position;
		ringMesh.rotation.x = -0.5 * Math.PI;
	}
	return { mesh, obj };
};

// render sun
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
	map: textureLoader.load(sunTexture),
});

const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const mercury = createPlanet(3.2, mercuryTexture, 28);
const saturn = createPlanet(10, saturnTexture, 138, {
	innerRadius: 10,
	outerRadius: 20,
	texture: saturnRingTexture,
});
const venus = createPlanet(5.8, venusTexture, 44);
const earth = createPlanet(6, earthTexture, 62);
const mars = createPlanet(4, marsTexture, 78);
const jupiter = createPlanet(12, jupiterTexture, 100);
const uranus = createPlanet(7, uranusTexture, 176, {
	innerRadius: 7,
	outerRadius: 12,
	texture: uranusRingTexture,
});
const neptune = createPlanet(7, neptuneTexture, 200);
const pluto = createPlanet(2.8, plutoTexture, 216);

//  Ánh sáng từ 1 điểm đến mọi vật thể
const pointLight = new THREE.PointLight(new THREE.Color('#7a7a7a'), 2, 300);
scene.add(pointLight);
// gui.addColor(params, "pointLight").onChange((e) => {
// 	pointLight.color.set(e)
// });
const animate = () => {
	requestAnimationFrame(animate);
	sun.rotateY(0.004);
	mercury.mesh.rotateY(0.004);
	mercury.obj.rotateY(0.04);

	saturn.mesh.rotateY(0.038);
	saturn.obj.rotateY(0.0009);

	venus.mesh.rotateY(0.002);
	venus.obj.rotateY(0.015);

	earth.mesh.rotateY(0.02);
	earth.obj.rotateY(0.01);

	mars.mesh.rotateY(0.018);
	mars.obj.rotateY(0.008);

	jupiter.mesh.rotateY(0.04);
	jupiter.obj.rotateY(0.002);

	saturn.mesh.rotateY(0.038);
	saturn.obj.rotateY(0.0009);

	uranus.mesh.rotateY(0.03);
	uranus.obj.rotateY(0.0004);

	neptune.mesh.rotateY(0.032);
	neptune.obj.rotateY(0.0001);

	pluto.mesh.rotateY(0.008);
	pluto.obj.rotateY(0.00007);

	starMesh.rotateY(0.0001);

	bloomComposer.render();
	renderer.render(scene, camera);
};
animate();
// renderer.setAnimationLoop(animate);
renderer.render(scene, camera);
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
