import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js';

// create the scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const axesHelper = new THREE.AxesHelper( 1000 );
scene.add( axesHelper );

const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);



// create the spherical terrain
var sphereGeometry = new THREE.SphereGeometry(6, 32, 32);
var sphereMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('planet.jpg') });
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0, 0);
sphere.rotation.x = Math.PI/2;

// create the character
var characterGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
var characterMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.set(0, sphere.geometry.parameters.radius + character.geometry.parameters.height/2, 0);

// add the spherical terrain and character to the scene
scene.add(sphere);
//scene.add(character);


// move the camera back to see the terrain

character.rotation.z = Math.PI;

// create the renderer and add it to the DOM
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new OrbitControls( camera, renderer.domElement );
controls.target = character.position;

controls.update();

const gltfLoader = new GLTFLoader();

let spaceshipModel;
const directionalLight = new THREE.DirectionalLight( 0xffffff, 10 );
directionalLight.position.set(10,0,0);

gltfLoader.load('Free_SciFi-Fighter/untitled.glb', function(gltf) {
    spaceshipModel = gltf.scene;
    const scale = 0.003
    spaceshipModel.scale.set(scale, scale, scale);
    spaceshipModel.position.set(0,6,0)
    spaceshipModel.rotation.y = Math.PI/2;
    sphere.add(spaceshipModel);
    spaceshipModel.add( directionalLight );
});


// create a variable to keep track of the running animation
var runAnimation = 0;

// create the update function
function update() {
    requestAnimationFrame(update);
    // update the running animation
    //runAnimation += 0.001;

    // rotate the sphere
    sphere.rotation.y += 0.001;

    // update the character's position in the middle of the sphere
    var radius = sphere.geometry.parameters.radius/3;
    spaceshipModel.position.x = Math.sin(runAnimation) * radius;
    spaceshipModel.position.z = Math.cos(runAnimation) * radius;
    
    // update the camera position to be on the surface of the sphere
    camera.position.x = spaceshipModel.position.x - 1;
    camera.position.y = spaceshipModel.position.y;
    camera.position.z = spaceshipModel.position.z;
    

    camera.lookAt(spaceshipModel.position);
    // camera.rotation.z = -Math.PI/2;
    // camera.rotation.y = -Math.PI/2;

    // render the scene
    renderer.render(scene, camera);
}

// start the update loop
update();