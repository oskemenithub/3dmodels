// Variables for setup
let container;
let camera;
let renderer;
let scene;
let currentObject;
let isMouseDown = false;
let initialMouseX = 0;
let initialMouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

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
  const objectSelector = document.getElementById("objectSelector");

  function loadObject(selectedObject) {
    const objectPath = `./3D/${selectedObject}.glb`;
    let loader = new THREE.GLTFLoader();
    loader.load(objectPath, function (gltf) {
      if (currentObject) {
        scene.remove(currentObject);
      }
  
      currentObject = gltf.scene;
      scene.add(currentObject);
  
      // Calculate the initial scale and position of the object
      const boundingBox = new THREE.Box3().setFromObject(currentObject);
      const center = boundingBox.getCenter(new THREE.Vector3());
      const size = boundingBox.getSize(new THREE.Vector3());
  
      const maxDimension = Math.max(size.x, size.y, size.z);
      const desiredScale = container.clientHeight / (20 * maxDimension); // Adjust the scale based on the container height
      const desiredPosition = new THREE.Vector3(0, 0, -maxDimension * desiredScale * 0.5); // Set the position to center the object
  
      currentObject.scale.set(desiredScale, desiredScale, desiredScale);
      currentObject.position.copy(desiredPosition);
  
      animate();
    });
  }
  

  objectSelector.addEventListener("change", function (event) {
    const selectedObject = event.target.value;
    loadObject(selectedObject);
  });

  const initialSelectedObject = objectSelector.value;
  loadObject(initialSelectedObject);

  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousemove", onMouseMove);
}

function onMouseDown(event) {
  isMouseDown = true;
  initialMouseX = event.clientX;
  initialMouseY = event.clientY;
}

function onMouseUp() {
  isMouseDown = false;
}

function onMouseMove(event) {
  if (!isMouseDown) return;

  const mouseX = event.clientX;
  const mouseY = event.clientY;

  const deltaX = mouseX - initialMouseX;
  const deltaY = mouseY - initialMouseY;

  targetRotationY += deltaX * 0.01;
  targetRotationX += deltaY * 0.01;

  initialMouseX = mouseX;
  initialMouseY = mouseY;
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate the camera around the object
  const radius = 70;
  const angle = targetRotationY * Math.PI / 180; // Convert to radians
  camera.position.x = Math.sin(angle) * radius;
  camera.position.z = Math.cos(angle) * radius;
  camera.lookAt(scene.position);

  // Rotate the object based on mouse movements
  currentObject.rotation.y += 0.1 * (targetRotationY - currentObject.rotation.y);
  currentObject.rotation.x += 0.1 * (targetRotationX - currentObject.rotation.x);

  // Calculate the maximum allowed object scale based on the canvas size
  const maxCanvasSize = Math.min(container.clientWidth, container.clientHeight);
  const maxAllowedScale = maxCanvasSize / 4; // Adjust the value as desired

  // Scale the object while keeping it within the canvas limits
  const boundingBox = new THREE.Box3().setFromObject(currentObject);
  const objectSize = boundingBox.getSize(new THREE.Vector3());
  const maxObjectSize = Math.max(objectSize.x, objectSize.y, objectSize.z);

  if (maxObjectSize > maxAllowedScale) {
    const scaleDownFactor = maxAllowedScale / maxObjectSize;
    currentObject.scale.set(scaleDownFactor, scaleDownFactor, scaleDownFactor);
  }

  renderer.render(scene, camera);
}






init();

function onWindowResize() {
  const aspect = container.clientWidth / container.clientHeight;

  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);

  if (currentObject) {
    const boundingBox = new THREE.Box3().setFromObject(currentObject);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDimension;

    currentObject.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    currentObject.scale.set(scale, scale, scale);
  }
}

window.addEventListener("resize", onWindowResize);
