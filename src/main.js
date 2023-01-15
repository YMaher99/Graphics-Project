import * as THREE from "https://cdn.skypack.dev/three@0.136";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js";
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
let spaceshipModel;
const ambient = new THREE.AmbientLight(0xffffff);
const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
const gltfLoader = new GLTFLoader();

// Add the coin to the scene

function createPlane() {
  geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
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
  scene.add(coinMesh);
  const axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);

  camera.rotation.x = Math.PI / 2;

  plane.position.set(0, -2, 0);
  scene.add(plane);

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
  plane.add(directionalLight);
  directionalLight.position.set(0, 10, 0);
}

function loadSpaceShip() {
  gltfLoader.load("../assets/SciFi_Fighter.glb", function (gltf) {
    spaceshipModel = gltf.scene;
    const scale = 0.003;
    spaceshipModel.scale.set(scale, scale, scale);
    spaceshipModel.position.set(0, 6, 0);
    // spaceshipModel.rotation.y = Math.PI / 2;
    scene.add(spaceshipModel);
    spaceshipModel.add(directionalLight);
  });
}

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

createPlane();
loadSpaceShip()
createScene();
createCoin();
addLight();
generateCoinPosition();
animate();
