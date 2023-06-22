// Variables for setup
let container;
let camera;
let renderer;
let scene;
let house;

function init() {
  container = document.querySelector(".scene");

  // Create scene
  scene = new THREE.Scene();

  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 1000;

  // Camera setup
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 5, 50);

  const ambient = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(50, 50, 100);
  scene.add(light);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  // Load Model
  let loader = new THREE.GLTFLoader();
  loader.load("./3D/gulim+++.glb", function(gltf) {
    scene.add(gltf.scene);
    house = gltf.scene.children[0];
  
    // Adjust the scale of the object
    house.scale.set(5, 5, 5); // Adjust the scale values as needed
  
    animate();
  });
  
}

function animate() {
  requestAnimationFrame(animate);
  
  // Modify the rotation values for each axis
  house.rotation.x += 0.000; // Rotate around the x-axis
  house.rotation.y += 0.005; // Rotate around the y-axis
  house.rotation.z += 0.0015; // Rotate around the z-axis

  renderer.render(scene, camera);
}


init();

function onWindowResize() {
  // Calculate the new aspect ratio
  const aspect = container.clientWidth / container.clientHeight;

  // Update the camera
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  // Update the renderer size
  renderer.setSize(container.clientWidth, container.clientHeight);

  // Adjust the size and position of the object
  const boundingBox = new THREE.Box3().setFromObject(house);
  const center = boundingBox.getCenter(new THREE.Vector3());

  // Adjust the object's position to the center of the screen
  house.position.x = -center.x;
  house.position.y = -center.y;

  // Calculate the scale factor based on the aspect ratio
  const scaleFactor = Math.max(
    boundingBox.max.x - boundingBox.min.x,
    boundingBox.max.y - boundingBox.min.y
  );

  // Adjust the object's scale to cover most of the website
  house.scale.set(aspect * scaleFactor, aspect * scaleFactor, aspect * scaleFactor);
}

window.addEventListener("resize", onWindowResize);
