import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';

// create the scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// create the spherical terrain
var sphereGeometry = new THREE.SphereGeometry(6, 32, 32);
var sphereMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('planet.jpg') });
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0, 0);

// create the character
var characterGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
var characterMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.set(0, sphere.geometry.parameters.radius + character.geometry.parameters.height/2, 0);


var objLoader = new THREE.OBJLoader();
objLoader.load('Free_SciFi-Fighter\SciFi_Fighter_AK5.obj', function(mesh) {
    scene.add(mesh);
});

// add the spherical terrain and character to the scene
scene.add(sphere);
scene.add(character);

// move the camera back to see the terrain
camera.position.z = 10;

// create the renderer and add it to the DOM
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new OrbitControls( camera, renderer.domElement );
controls.target = character.position;
controls.update();

// create a variable to keep track of the running animation
var runAnimation = 0;

// create the update function
function update() {
    requestAnimationFrame(update);

    // update the running animation
    runAnimation += 0.01;

    // rotate the sphere
    sphere.rotation.y += 0.01;

    // update the character's position in the middle of the sphere
    var radius = sphere.geometry.parameters.radius;
    character.position.x = Math.sin(runAnimation) * radius;
    character.position.z = Math.cos(runAnimation) * radius;
    
    // update the camera position to be on the surface of the sphere
    camera.position.x = character.position.x;
    camera.position.y = character.position.y + radius;
    camera.position.z = character.position.z;
    camera.lookAt(character.position);
    // render the scene
    renderer.render(scene, camera);
}

// start the update loop
update();