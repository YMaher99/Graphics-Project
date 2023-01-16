import * as THREE from "https://cdn.skypack.dev/three@0.136";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from "https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.136/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three@0.136/examples/jsm/postprocessing/RenderPass.js";
import { FilmPass } from "https://cdn.skypack.dev/three@0.136/examples/jsm/postprocessing/FilmPass.js";
import { BloomPass } from "https://cdn.skypack.dev/three@0.136/examples/jsm/postprocessing/BloomPass.js";

// alert("Controls: Use A to go left and D to go right\nHow To Play: avoid the monster or collect the mushroom to get a shield that allows you to kill the monster.\nGet score by surviving and killing the mosnter")

// Set up the scene
let scene;
let camera;
let renderer;
let material;
let plane;
let coinGeometry;
let coinMaterial; //gold color;
let coinMesh;
let playerModel;
let enemyModel;
let mushroomModel;
let poweredUp = false;
let sphere;
let destination = 0;
let score = 0;

let playSFX = false;
let enemyMixer;
let playerMixer;

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

const gltfLoader = new GLTFLoader();
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

// Loading the eat sound
const runningSound = new THREE.Audio(listener);
const enemySpawningSound = new THREE.Audio(listener);
const poweringUpSound = new THREE.Audio(listener);
const poweringDownSound = new THREE.Audio(listener);
const defeatSound = new THREE.Audio(listener);

audioLoader.load("../assets/sounds/running.mp3", function (buffer) {
  runningSound.setBuffer(buffer);
  runningSound.setLoop(false);
  runningSound.setVolume(0.1);
  // runningSound.play()
});
audioLoader.load("../assets/sounds/monsterSpawning.mp3", function (buffer) {
  enemySpawningSound.setBuffer(buffer);
  enemySpawningSound.setLoop(false);
  enemySpawningSound.setVolume(0.1);
});

audioLoader.load("../assets/sounds/powerupSound.mp3", function (buffer) {
  poweringUpSound.setBuffer(buffer);
  poweringUpSound.setLoop(false);
  poweringUpSound.setVolume(0.1);
});
audioLoader.load("../assets/sounds/powerDownSound.mp3", function (buffer) {
  poweringDownSound.setBuffer(buffer);
  poweringDownSound.setLoop(false);
  poweringDownSound.setVolume(0.1);
});
audioLoader.load("../assets/sounds/defeat.mp3", function (buffer) {
  defeatSound.setBuffer(buffer);
  defeatSound.setLoop(false);
  defeatSound.setVolume(0.5);
});

// Add the coin to the scene

function createPlane() {
  const geometry = new THREE.PlaneGeometry(35, 1000, 100, 100);
  const texture = new THREE.TextureLoader().load("../assets/asphalt.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  // set the number of times the texture should repeat in each direction
  texture.repeat.set(10, 400);
  material = new THREE.MeshBasicMaterial({
    // color: 0xff8875,
    side: THREE.DoubleSide,
    map: texture,
  });
  plane = new THREE.Mesh(geometry, material);
}
function createScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x11111f, 0.04);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color);

  document.body.appendChild(renderer.domElement);
  //scene.add(coinMesh);

  camera.rotation.x = Math.PI / 2;

  plane.position.set(0, -2, 0);
  scene.add(plane);

  camera.position.set(0, -4, 0);

  camera.rotation.x -= Math.PI / 6;
  // Set up the camera
  camera.position.z = 3;
  camera.add(listener);
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
}

function loadSpaceShip() {
  gltfLoader.load("../assets/player/player.glb", function (gltf) {
    playerModel = gltf.scene;
    const scale = 1.5;
    playerModel.scale.set(scale, scale, scale);
    playerModel.position.set(0, 0, 0);
    playerModel.rotation.x = Math.PI / 2;
    playerModel.rotation.y = Math.PI;

    // create an animation mixer
    playerMixer = new THREE.AnimationMixer(playerModel);

    // Get the animations from the GLTF file
    let animations = gltf.animations;
    playerMixer.clipAction(animations[0]).play();
    // create the sphere geometry
    const sphereGeometry = new THREE.SphereGeometry(
      4,
      32,
      32,
      0,
      Math.PI,
      0,
      Math.PI
    );

    // create the sphere material
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: "#218ffe",
      transparent: true,
      opacity: 0.5,
    });

    // create the sphere mesh
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // sphere.rotation.y =  -Math.PI /2
    // sphere.rotation.z =  Math.PI

    // position the sphere
    // sphere.position.set(0, 2, -0.5);
    sphere.position.set(0, 2, -10);
    scene.add(playerModel);
    scene.add(sphere);
  });
}

// Animate the scene
let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();
  if (poweredUp) {
    sphere.position.set(playerModel.position.x, 2, -0.5);
  }
  plane.position.y -= 0.1;
  enemyModel.position.y -= 0.1;
  mushroomModel.position.y -= 0.1;

  if (destination - playerModel.position.x > 0.5) {
    playerModel.rotation.y = Math.PI - Math.PI / 6;
  } else if (destination - playerModel.position.x < -0.5) {
    playerModel.rotation.y = Math.PI + Math.PI / 6;
  } else {
    playerModel.rotation.y = Math.PI;
  }

  playerModel.position.x += (destination - playerModel.position.x) / 20;
  camera.position.x = playerModel.position.x;

  if (plane.position.y < -50) {
    plane.position.y = 0;
    enemyModel.position.set(random_coord(), 40, 0);
    if (playSFX) {
      enemySpawningSound.play();
    }
    mushroomModel.position.set(random_coord(), 30, 1);
  }

  if (isColliding(playerModel, enemyModel)) {
    if (poweredUp) {
      enemyModel.position.set(0, 0, -50);
      poweredUp = false;
      sphere.position.set(0, 2, -10);
      score += 100;
      score_folder.controllers[0].setValue(Math.round(score));
      if (playSFX) {
        poweringDownSound.play();
      }
    } else {
      defeatSound.play();
      alert("YOU LOST");
      location.reload();
    }
  }
  score += 0.5;
  score_folder.controllers[0].setValue(Math.round(score));

  if (isColliding(playerModel, mushroomModel)) {
    poweredUp = true;
    sphere.position.set(playerModel.position.x, 2, -0.5);
    mushroomModel.position.z = -50;
    if (playSFX) {
      poweringUpSound.play();
    }
  }
	leavesMaterial.uniforms.time.value = clock.getElapsedTime();
  leavesMaterial.uniformsNeedUpdate = true;
  enemyMixer.update(delta);
  playerMixer.update(delta);
  renderer.clear()
  renderer.render(scene, camera);
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
      return (
        obj2.position.y > -0.05 &&
        obj2.position.y < 0.05 &&
        Math.abs(obj1.position.x - obj2.position.x) < 1
      );
    }
  }
}

function initUI() {
  const soundButton = document.getElementById("sound-btn");
  const onSoundToggle = () => {
    if (playSFX) {
      runningSound.stop();
      playSFX = false;
    } else {
      runningSound.play();
      playSFX = true;
    }
  };
  playSFX = false;
  onSoundToggle();
  soundButton.onclick = onSoundToggle;
}

window.addEventListener("keydown", (event) => {
  const speed = 5;
  const limit = speed * 3;
  switch (event.key) {
    case "D":
    case "d":
      // playerModel.position.x += speed;
      destination += speed;
      break;
    case "a":
    case "A":
      // playerModel.position.x -= speed;
      destination -= speed;
      break;
    default:
      break;
  }
  if (destination > limit) {
    destination = limit;
  } else if (destination < -limit) {
    destination = -limit;
  }

  camera.position.x = playerModel.position.x;
});

function random_coord() {
  return Math.random() > 0.5
    ? Math.floor(Math.random() * 3 + 1) * 5
    : -1 * Math.floor(Math.random() * 3 + 1) * 5;
}

gltfLoader.load("../assets/player/enemy.glb", function (gltf) {
  enemyModel = gltf.scene;
  const scale = 1.5;
  enemyModel.scale.set(scale, scale, scale);

  // create an animation mixer
  enemyMixer = new THREE.AnimationMixer(enemyModel);

  // Get the animations from the GLTF file
  let animations = gltf.animations;
  enemyMixer.clipAction(animations[2]).play();

  enemyModel.position.set(random_coord(), 40, 0);
  enemyModel.rotation.x = Math.PI / 2;

  scene.add(enemyModel);
});

gltfLoader.load("../assets/mushroom.glb", function (gltf) {
  mushroomModel = gltf.scene;
  const scale = 2;
  mushroomModel.scale.set(scale, scale, scale);

  mushroomModel.position.set(random_coord(), 30, 1);
  mushroomModel.rotation.x = Math.PI / 2;

  scene.add(mushroomModel);
});

let gui = new GUI();
var myObject = {
  Score: 0,
};
var score_folder = gui.addFolder("Score");
score_folder.add(myObject, "Score");
var controls = {
  Left: "A",
  Right: "D",
};
gui.title("");
var controls_folder = gui.addFolder("Controls");
controls_folder.add(controls, "Left");
controls_folder.add(controls, "Right");

const vertexShader = `
  varying vec2 vUv;
  uniform float time;
  
	void main() {

    vUv = uv;
    
    // VERTEX POSITION
    
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	mvPosition = instanceMatrix * mvPosition;
    #endif
    
    // DISPLACEMENT
    
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1.0 - cos( uv.y * 3.1416 / 2.0 );
    
    float displacement = sin( mvPosition.z + time * 10.0 ) * ( 0.1 * dispPower );
    mvPosition.z += displacement;
    
    //
    
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`;

const fragmentShader = `
  varying vec2 vUv;
  
  void main() {
  	vec3 baseColor = vec3( 0.41, 1.0, 0.5 );
    float clarity = ( vUv.y * 0.5 ) + 0.5;
    gl_FragColor = vec4( baseColor * clarity, 1 );
  }
`;

const uniforms = {
	time: {
  	value: 0
  }
}

const leavesMaterial = new THREE.ShaderMaterial({
	vertexShader,
  fragmentShader,
  uniforms,
  side: THREE.DoubleSide
});

/////////
// MESH
/////////

const instanceNumber = 2 * 5000;
const dummy = new THREE.Object3D();

const geometry = new THREE.PlaneGeometry( 0.1, 3, 1, 4 );
geometry.translate( 0, 0.5, 0 ); // move grass blade geometry lowest point at 0.

const instancedMesh = new THREE.InstancedMesh( geometry, leavesMaterial, instanceNumber );


// Position and scale the grass blade instances randomly.

for ( let i=0 ; i<instanceNumber ; i++ ) {

	dummy.position.set(
  	( Math.random() - 0.5 ) * 10,
    0,
    ( Math.random() - 0.5 ) * 10
  );
  
  dummy.scale.setScalar( 0.5 + Math.random() * 0.5 );
  
  dummy.rotation.y = Math.random() * Math.PI;
  
  dummy.updateMatrix();
  instancedMesh.setMatrixAt( i, dummy.matrix );

}

instancedMesh.position.set(25, 0, 0)
instancedMesh.rotation.x = Math.PI / 2
instancedMesh.scale.set(1, 1, 1)
scene.add( instancedMesh );


initUI();
animate();
