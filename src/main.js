import * as THREE from "https://cdn.skypack.dev/three@0.136";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js";
import { Water } from "https://cdn.skypack.dev/three@0.136/examples/jsm/objects/Water.js";
import { Sky } from "https://cdn.skypack.dev/three@0.136/examples/jsm/objects/Sky.js";

// Set up the scene
let scene;
let camera;
let renderer;
let geometry;
let material;
let plane;
let coinGeometry;
let coinMaterial; //gold color;
let coinMesh;
let playerModel;
let enemyModel;
const ambient = new THREE.AmbientLight(0xffffff);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
const gltfLoader = new GLTFLoader();

// Add the coin to the scene

function createPlane() {
  geometry = new THREE.PlaneGeometry(50, 1000, 100, 100);
  material = new THREE.MeshPhongMaterial({
    color: 0xff8875,
    side: THREE.DoubleSide,
  });
  plane = new THREE.Mesh(geometry, material);
}
function createScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  //scene.add(coinMesh);
  const axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);

  camera.rotation.x = Math.PI / 2;

  plane.position.set(0, -2, 0);
  scene.add(plane);

  camera.position.set(0, -4, 0);

  camera.rotation.x -= Math.PI / 6;
  // Set up the camera
  camera.position.z = 3;
}

function createCoin() {
  coinGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  coinMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 }); //gold color
  coinMesh = new THREE.Mesh(coinGeometry, coinMaterial);
}

// Generate a random position for the coin
function generateCoinPosition() {
  var x = Math.floor(Math.random() * 100) - 50; // x position between -50 and 50
  var y = Math.floor(Math.random() * 100) - 50; // y position between -50 and 50
  var z = Math.floor(Math.random() * 10) + 1; // z position between 1 and 10
  coinMesh.position.set(x, y, z);
}

function addLight() {
  scene.add(ambient);
  scene.add(directionalLight);
  directionalLight.position.set(0, -1, 20);
  const helper = new THREE.DirectionalLightHelper(directionalLight, 1000);
  // plane.add(directionalLight);
  helper.update();
  scene.add(helper);
}

function loadSpaceShip() {
  gltfLoader.load("../assets/player/player.glb", function (gltf) {
    playerModel = gltf.scene;
    const scale = 1.5;
    playerModel.scale.set(scale, scale, scale);
    playerModel.position.set(0, 0, 0);
    playerModel.rotation.x = Math.PI / 2;
    playerModel.rotation.y = Math.PI;
  
  
    scene.add(playerModel);
  });
/*   gltfLoader.load("../assets/SciFi_Fighter.glb", function (gltf) {
    spaceshipModel = gltf.scene;
    const scale = 0.002;
    spaceshipModel.scale.set(scale, scale, scale);
    spaceshipModel.position.set(0, 0, 2);
    spaceshipModel.rotation.x = -Math.PI / 2;
    //scene.add(spaceshipModel);
  }); */
}

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  plane.position.y -= 0.1;
  enemyModel.position.y -= 0.1;
  
  if (plane.position.y < -50) {
    plane.position.y = 0;
    enemyModel.position.set(random_coord(),40,0);
  }
  if (isColliding(playerModel,enemyModel)){console.log("BOO")}
}

function createSkyBox() {

  // create the skybox geometry
  var skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);

  // create the skybox material
  var skyboxMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("../assets/skybox.jpg"),
    side: THREE.BackSide,
  });
  // create the skybox mesh
  var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

  skybox.rotation.x = Math.PI / 2;

  // add the skybox to the scene
  scene.add(skybox);
}

createPlane();
loadSpaceShip();
createScene();
createCoin();
addLight();
generateCoinPosition();
createSkyBox();

function isColliding(obj1, obj2) {
	if (obj1) {
	  if (obj2) {

		return ((obj2.position.y > -0.05 && obj2.position.y < 0.05) && obj1.position.x == obj2.position.x)
	  }
	}
  }

window.addEventListener("keydown", (event) => {
  const speed = 5;
  const limit = speed * 3;
  switch (event.key) {
    case "D":
    case "d":
      playerModel.position.x += speed;
      break;
    case "a":
    case "A":
      playerModel.position.x -= speed;
      break;
    default:
      break;
  }
  if (playerModel.position.x > limit) {
    playerModel.position.x = limit;
  } else if (playerModel.position.x < -limit) {
    playerModel.position.x = -limit;
  }
  camera.position.x = playerModel.position.x;
});

function random_coord(){
	return Math.random()>0.5 ?  Math.floor(Math.random()*3) * 5:  -1 * (Math.floor(Math.random()*3)) *5 ;
}

gltfLoader.load("../assets/player/enemy.glb", function (gltf) {
  enemyModel = gltf.scene;
  const scale = 1.5;
  enemyModel.scale.set(scale, scale, scale);
  
  enemyModel.position.set(random_coord(), 40, 0);
  enemyModel.rotation.x = Math.PI / 2;



  scene.add(enemyModel);
})

animate();
