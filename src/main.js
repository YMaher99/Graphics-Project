// Import threejs, DAT GUI, and GLTFLoader
import * as THREE from "https://cdn.skypack.dev/three@0.136";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from "https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js";

// Show an alert message with instructions for the game
alert("Controls: Use A to go left and D to go right\nHow To Play: avoid the monster or collect the mushroom to get a shield that allows you to kill the monster.\nGet score by surviving and killing the mosnter.\nPlease Press The \"Toggle Sound\" Button to hear the sounds. DEFAULT IS MUTED")

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

//create lights
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(0, 0, 10)

// create GLTF loader and audio listener
const gltfLoader = new GLTFLoader();
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

// Loading the different sound effects
const runningSound = new THREE.Audio(listener);
const enemySpawningSound = new THREE.Audio(listener);
const poweringUpSound = new THREE.Audio(listener);
const poweringDownSound = new THREE.Audio(listener);
const defeatSound = new THREE.Audio(listener);
const bgMusic = new THREE.Audio(listener);

// load the background music
audioLoader.load("../assets/sounds/bgMusic.mp3", function (buffer) {
  bgMusic.setBuffer(buffer);
  bgMusic.setLoop(true);
  bgMusic.setVolume(0.1);
});

//load the running sound
audioLoader.load("../assets/sounds/running.mp3", function (buffer) {
  runningSound.setBuffer(buffer);
  runningSound.setLoop(true);
  runningSound.setVolume(0.3);
  // runningSound.play()
});

//load the enemy spawning sound
audioLoader.load("../assets/sounds/monsterSpawning.mp3", function (buffer) {
  enemySpawningSound.setBuffer(buffer);
  enemySpawningSound.setLoop(false);
  enemySpawningSound.setVolume(0.1);
});

//load the powering up sound
audioLoader.load("../assets/sounds/powerupSound.mp3", function (buffer) {
  poweringUpSound.setBuffer(buffer);
  poweringUpSound.setLoop(false);
  poweringUpSound.setVolume(0.1);
});

// load the powering down sound
audioLoader.load("../assets/sounds/powerDownSound.mp3", function (buffer) {
  poweringDownSound.setBuffer(buffer);
  poweringDownSound.setLoop(false);
  poweringDownSound.setVolume(0.1);
});

// load the defeat sound
audioLoader.load("../assets/sounds/defeat.mp3", function (buffer) {
  defeatSound.setBuffer(buffer);
  defeatSound.setLoop(false);
  defeatSound.setVolume(0.5);
});

// Function to create the plane
function createPlane() {
  // create the plane geometry
  const geometry = new THREE.PlaneGeometry(35, 1000, 100, 100);
  // load the texture for the plane
  const texture = new THREE.TextureLoader().load("../assets/asphalt.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  // set the number of times the texture should repeat in each direction
  texture.repeat.set(10, 400);
  // Create the material for the plane
  material = new THREE.MeshBasicMaterial({
    // color: 0xff8875,
    side: THREE.DoubleSide,
    map: texture,
  });
  // Create the plane mesh
  plane = new THREE.Mesh(geometry, material);
}
function createScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x11111f, 0.05);
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

//function to add ambient and directional light to the scene, and set the position of the directional light.
function addLight() {
  scene.add(ambient);
  scene.add(directionalLight);
  directionalLight.position.set(0, -1, 20);
}

// function to create the player
function loadSpaceShip() {
  gltfLoader.load("../assets/player/player.glb", function (gltf) {
    // Assigns the loaded model to the playerModel variable
    playerModel = gltf.scene;
    const scale = 1.5;
    //scale the player
    playerModel.scale.set(scale, scale, scale);
    //position the player
    playerModel.position.set(0, 0, 0);
    //rotate the player
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

    // position the sphere
    sphere.position.set(0, 2, -10);
    scene.add(playerModel);
    scene.add(sphere);
  });
}

// Animate the scene
let clock = new THREE.Clock();//create a new clock to track the delta time for animation
function animate() {
  requestAnimationFrame(animate);//call the animate function to create a loop

  let delta = clock.getDelta();//get the delta time from the clock

  // move the position of the sphere if the player is powered up
  if (poweredUp) {
    sphere.position.set(playerModel.position.x, 2, -0.5);
  }

  // move the position of the plane, enemy model, mushroom model, instanced mesh, and grass floor downwards
  plane.position.y -= 0.1;
  enemyModel.position.y -= 0.1;
  mushroomModel.position.y -= 0.1;
  instancedMeshRight.position.y -= 0.1;
  instancedMeshLeft.position.y -= 0.1;
  grassFloorLeft.position.y -= 0.1;
  grassFloorRight.position.y -= 0.1;

  // rotate the player model based on its destination position
  if (destination - playerModel.position.x > 0.5) {
    playerModel.rotation.y = Math.PI - Math.PI / 6;
  } else if (destination - playerModel.position.x < -0.5) {
    playerModel.rotation.y = Math.PI + Math.PI / 6;
  } else {
    playerModel.rotation.y = Math.PI;
  }

  // move the player model towards its destination position
  playerModel.position.x += (destination - playerModel.position.x) / 20;
  camera.position.x = playerModel.position.x;

  // check if the plane is out of bounds, if so reset its position and spawn a new enemy
  if (plane.position.y < -50) {
    plane.position.y = 0;
    enemyModel.position.set(random_coord(), 40, 0);
    if (playSFX) {
      enemySpawningSound.play();
    }
    mushroomModel.position.set(random_coord(), 30, 1);
  }
  if(instancedMeshLeft.position.y < -50){
    instancedMeshLeft.position.y = 0;
    instancedMeshRight.position.y = 0;
    grassFloorLeft.position.y = 0;
    grassFloorRight.position.y = 0;
  }

  // check for collision between the player and enemy
  if (isColliding(playerModel, enemyModel)) {
    //take action if player is powered up
    if (poweredUp) {
      enemyModel.position.set(0, 0, -50);
      poweredUp = false;
      sphere.position.set(0, 2, -10);
      score += 100;
      score_folder.controllers[0].setValue(Math.round(score));
      if (playSFX) {
        poweringDownSound.play();
      }
    }
    //else end the game 
    else {
      bgMusic.stop()
      runningSound.stop();
      defeatSound.play();
      
      alert("YOU LOST");

      location.reload();
    }
  }
  score += 0.5;
  score_folder.controllers[0].setValue(Math.round(score));// update the score

  // check for collision between the player and mushroom, if a collision is detected, power up the player
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
  pointLight.position.x = playerModel.position.x;
  enemyMixer.update(delta);
  playerMixer.update(delta);
  renderer.clear()
  renderer.render(scene, camera);
}

//function to create a skybox
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

// Function to check the collision between two objects
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

// function to sets up the user interface for controlling sound effects
function initUI() {
  const soundButton = document.getElementById("sound-btn");
  const onSoundToggle = () => {
    if (playSFX) {
      bgMusic.stop()
      runningSound.stop();
      playSFX = false;
    } else {
      bgMusic.play()
      runningSound.play();
      playSFX = true;
    }
  };
  soundButton.onclick = onSoundToggle;
}

// Add an event listener for when a user presses keyboard buttons (i.e. controls for the game)
window.addEventListener("keydown", (event) => {
  const speed = 5;
  const limit = speed * 3;
  switch (event.key) {
    // if player press 'D' increments the destination by 5 to move to the right
    case "D":
    case "d":
      // playerModel.position.x += speed;
      destination += speed;
      break;
    // if player press 'A' decrements the destination by 5 to move to the left  
    case "a":
    case "A":
      // playerModel.position.x -= speed;
      destination -= speed;
      break;
    default:
      break;
  }
  //if destination is out of road bonds set the destination to the limit
  if (destination > limit) {
    destination = limit;
  } else if (destination < -limit) {
    destination = -limit;
  }
  //The camera's x position is then set to match the player's x position
  camera.position.x = playerModel.position.x;
});

//function to generate random coordinates for positioning the models
function random_coord() {
  // return either a positive or negative value of 5, 10, or 15
  return Math.random() > 0.5
    ? Math.floor(Math.random() * 3 + 1) * 5
    : -1 * Math.floor(Math.random() * 3 + 1) * 5;
}

// Load the "enemy" model using the GLTFLoader
gltfLoader.load("../assets/player/enemy.glb", function (gltf) {
  enemyModel = gltf.scene;
  // Scale the enemy by 1.5
  const scale = 1.5;
  enemyModel.scale.set(scale, scale, scale);

  // create an animation mixer
  enemyMixer = new THREE.AnimationMixer(enemyModel);

  // Get the animations from the GLTF file
  let animations = gltf.animations;
  enemyMixer.clipAction(animations[2]).play();

  // Position the enemy at a random x coordinate
  enemyModel.position.set(random_coord(), 40, 0);
  // Rotate the enemy 90 degrees on the x axis
  enemyModel.rotation.x = Math.PI / 2;

  // Add the enemy to the scene
  scene.add(enemyModel);
});

// Load the "mushroom" model using the GLTFLoader
gltfLoader.load("../assets/mushroom.glb", function (gltf) {
  mushroomModel = gltf.scene;
  // Scale the mushroom by 2
  const scale = 2;
  mushroomModel.scale.set(scale, scale, scale);

  // Position the mushroom at a random x coordinate
  mushroomModel.position.set(random_coord(), 30, 1);
  // Rotate the mushroom 90 degrees on the x axis
  mushroomModel.rotation.x = Math.PI / 2;

  // Add the mushroom to the scene
  scene.add(mushroomModel);
});

// Adding a GUI
let gui = new GUI();

// Score Values in the GUI
var myObject = {
  Score: 0,
};

// Add a folder to the GUI to display the score
var score_folder = gui.addFolder("Score");
score_folder.add(myObject, "Score");

// Control Values in the GUI
var controls = {
  Left: "A",
  Right: "D",
};

// Set GUI title to empty string
gui.title("");

// Add a folder to the GUI to display the controls
var controls_folder = gui.addFolder("Controls");
controls_folder.add(controls, "Left");
controls_folder.add(controls, "Right");

// create vertex shader for the grass
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

// create fragmentt shader for the grass
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

// Create a new ShaderMaterial using the vertex and fragment shaders and the uniforms.
const leavesMaterial = new THREE.ShaderMaterial({
	vertexShader,
  fragmentShader,
  uniforms,
  side: THREE.DoubleSide
});

/////////
// MESH
/////////

const instanceNumber =  4 * 5000;
const dummy = new THREE.Object3D();

const geometry = new THREE.PlaneGeometry( 0.1, 0.5, 1, 4 );
geometry.translate( 0, 0.5, 0 ); // move grass blade geometry lowest point at 0.

const instancedMeshRight = new THREE.InstancedMesh( geometry, leavesMaterial, instanceNumber );
const instancedMeshLeft = new THREE.InstancedMesh( geometry, leavesMaterial, instanceNumber );

// Position and scale the grass blade instances randomly.

for ( let i=0 ; i<instanceNumber ; i++ ) {

	dummy.position.set(
  	( Math.random() - 0.5 ) * 50,
    0,
    ( Math.random() - 0.5 ) * 200
  );
  
  dummy.scale.setScalar( 0.5 + Math.random() * 0.5 );
  
  dummy.rotation.y = Math.random() * Math.PI;
  
  dummy.updateMatrix();
  instancedMeshRight.setMatrixAt( i, dummy.matrix );
  instancedMeshLeft.setMatrixAt(i, dummy.matrix);  
}

// Create geometry, texture and material for the grass
const grassGeometry = new THREE.PlaneGeometry(50,200);
const grassTexture = new THREE.TextureLoader().load("../assets/grassGround.jpg");
const grassMaterial = new THREE.MeshBasicMaterial({map:grassTexture})
grassMaterial.map.wrapS = THREE.RepeatWrapping;
grassMaterial.map.wrapT = THREE.RepeatWrapping;
grassMaterial.map.repeat.set(5, 20);

// Create grass for the right and the left
const grassFloorRight = new THREE.Mesh(grassGeometry,grassMaterial);
const grassFloorLeft = new THREE.Mesh(grassGeometry,grassMaterial);

// Position the right and left grass in the scene
grassFloorRight.position.set(42.5, 0, 0)
scene.add(grassFloorRight);

grassFloorLeft.position.set(-42.5, 0, 0)
scene.add(grassFloorLeft);

instancedMeshRight.position.set(42.5, 0, 0)
instancedMeshRight.rotation.x = Math.PI / 2
//instancedMesh.scale.set(1, 1, 1)
scene.add( instancedMeshRight );

instancedMeshLeft.position.set(-42.5, 0, 0)
instancedMeshLeft.rotation.x = Math.PI / 2
//instancedMesh.scale.set(1, 1, 1)
scene.add( instancedMeshLeft );

// Add point light to the scene
scene.add(pointLight)

// Add event listener for resizing the game
window.addEventListener( 'resize', onWindowResize, false );

//function for handling the browser window resize
function onWindowResize(){
    // Update camera aspect ratio and projection matrix on window resize
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize( window.innerWidth, window.innerHeight );

}
// Call initialization function for UI
initUI();
// Call animation function
animate();
