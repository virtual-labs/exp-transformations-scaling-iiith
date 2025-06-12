"use strict";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js";
import { MOUSE } from "https://unpkg.com/three@0.128.0/build/three.module.js";

import { createCube, createOctahedron, createTetrahedron } from "./shapes.js";
import { Triangle } from "./Triangle.js";
import { createMaterials, getCameraSettings } from "./materials.js";

// Initialize DOM elements
const moveButton = document.getElementById("move-button");
const editButton = document.getElementById("edit-shape-btn");
const addButton = document.querySelector(".add-button");
let lockVertices = document.getElementById("lock-vertices-cb");
let lockZoom = document.getElementById("lock-zoom-cb");
let lockRotate = document.getElementById("lock-rotate-cb");
let xyGrid = document.getElementById("xy-grid-cb");
let yzGrid = document.getElementById("yz-grid-cb");
let xzGrid = document.getElementById("xz-grid-cb");
let container = document.getElementById("canvas-main");
let modalAdd = document.getElementById("add-modal");
let modalEdit = document.getElementById("edit-modal");
let spanEditModal = document.getElementsByClassName("close")[0];
let slider = document.getElementById("slider");

// Initialize slider
if (slider) {
slider.addEventListener("input", movePoint);
  slider.max = 1000;
  slider.min = 0;
slider.step = 1;
} else {
  console.warn('Slider not found');
}

// Initialize scaling values
let max_x_scale = parseFloat(document.getElementById("scale-x")?.value || "1");
let max_y_scale = parseFloat(document.getElementById("scale-y")?.value || "1");
let max_z_scale = parseFloat(document.getElementById("scale-z")?.value || "1");
let old_scale = [1, 1, 1];
let noofframes = 1000;

// Initialize scene variables
let scene,
  PI = 3.141592653589793,
  camera,
  renderer,
  orbit,
  shapes = [],
  xygrid = [],
  yzgrid = [],
  xzgrid = [],
  dragX = [],
  dragY = [],
  dragZ = [],
  shapeList = [],
  lock = 0,
  dir = [],
  arrowHelper = [],
  point = [],
  shapeVertex = [],
  size = 20,
  divisions = 20,
  mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster(),
  plane = new THREE.Plane(),
  pNormal = new THREE.Vector3(0, 1, 0);

let shapeCount = [0, 0, 0, 0];
let noOfShapes = 0;  // Initialize noOfShapes

// Initialize transformation matrix
let trans_matrix = new THREE.Matrix4();
trans_matrix.set(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
);

// Add event listeners for controls
if (lockVertices) {
  lockVertices.addEventListener("click", updateMouseButtons);
} else {
  console.warn('Lock vertices checkbox not found');
}

if (lockZoom) {
lockZoom.addEventListener("click", updateMouseButtons);
} else {
  console.warn('Lock zoom checkbox not found');
}

if (lockRotate) {
  lockRotate.addEventListener("click", updateMouseButtons);
  } else {
  console.warn('Lock rotate checkbox not found');
}

// Add event listeners for grid visibility
if (xyGrid) {
xyGrid.addEventListener("click", () => {
  if (xyGrid.checked) {
    let grid = new THREE.GridHelper(size, divisions);
    let vector3 = new THREE.Vector3(0, 1, 0);
    grid.lookAt(vector3);
    xygrid.push(grid);
    scene.add(xygrid[0]);
  } else {
    scene.remove(xygrid[0]);
    xygrid.pop();
  }
});
} else {
  console.warn('XY grid checkbox not found');
}

if (xzGrid) {
xzGrid.addEventListener("click", () => {
  if (xzGrid.checked) {
    let grid = new THREE.GridHelper(size, divisions);
    let vector3 = new THREE.Vector3(0, 0, 1);
    grid.lookAt(vector3);
    xzgrid.push(grid);
    scene.add(xzgrid[0]);
  } else {
    scene.remove(xzgrid[0]);
    xzgrid.pop();
  }
});
} else {
  console.warn('XZ grid checkbox not found');
}

if (yzGrid) {
yzGrid.addEventListener("click", () => {
  if (yzGrid.checked) {
    let grid = new THREE.GridHelper(size, divisions);
    grid.geometry.rotateZ(PI / 2);
    yzgrid.push(grid);
    scene.add(yzgrid[0]);
  } else {
    scene.remove(yzgrid[0]);
    yzgrid.pop();
  }
});
} else {
  console.warn('YZ grid checkbox not found');
}

// Define init as function expression
let init = function() {
  // Initialize arrays
  shapes = [];
  shapeList = [];
  point = [];
  shapeVertex = [];
  dragX = [];
  dragY = [];
  dragZ = [];
  arrowHelper = [];
  xygrid = [];
  yzgrid = [];
  xzgrid = [];
  dir = [];
  shapeCount = [0, 0, 0, 0];
  noOfShapes = 0;

  // Initialize transformation matrix
  trans_matrix = new THREE.Matrix4();
  trans_matrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);
  
  // Set up camera based on device
  const isMobile = window.innerWidth <= 800;
  camera = new THREE.PerspectiveCamera(
    isMobile ? 90 : 30, // Wider FOV for mobile
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  
  if (isMobile) {
    camera.position.set(12, 12, 12); // Closer position for mobile
    camera.lookAt(0, 0, 0); // Look at center
  } else {
    camera.position.set(25, 25, 25);
    camera.lookAt(10, 10, 5);
  }

  dir = [
    new THREE.Vector3(1, 0, 0), // +X
    new THREE.Vector3(0, 1, 0), // +Y
    new THREE.Vector3(0, 0, 1), // +Z
    new THREE.Vector3(-1, 0, 0), // -X
    new THREE.Vector3(0, -1, 0), // -Y
    new THREE.Vector3(0, 0, -1), // -Z
  ];

  const labels = ["+X", "+Y", "+Z", "-X", "-Y", "-Z"];
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 10;

  for (let i = 0; i < 6; i++) {
    let color;
    if (i === 0 || i === 3) {
      color = "red";
    } else if (i === 1 || i === 4) {
      color = "yellow";
    } else {
      color = "blue";
    }

    arrowHelper[i] = new THREE.ArrowHelper(dir[i], origin, length, color);
    scene.add(arrowHelper[i]);

    const labelPosition = dir[i].clone().multiplyScalar(length + 1);
    const label = createLabel(labels[i], labelPosition);
    scene.add(label);
  }

  // Create initial shapes
  createCube(5, 5, 5, shapes, shapeList, shapeCount, scene, point, shapeVertex, dragX, dragY, dragZ);
  createTetrahedron(4, 5, 2, shapes, shapeList, shapeCount, scene, point, shapeVertex, dragX, dragY, dragZ);
  createOctahedron(7, 5, -5, shapes, shapeList, shapeCount, scene, point, shapeVertex, dragX, dragY, dragZ);
  noOfShapes = 3;  // Set initial number of shapes

  updateShapeList(shapeList);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  let w = container.offsetWidth;
  let h = container.offsetHeight;
  renderer.setSize(w, 0.83 * h);
  container.appendChild(renderer.domElement);

  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  orbit.target.set(0, 0, 0);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.05;
};

// Define mainLoop as function expression
let mainLoop = function() {
  requestAnimationFrame(mainLoop);
  orbit.update();
  renderer.render(scene, camera);
};

// Initialize scene
if (container) {
  // Initialize the scene
  init();

  // Start the animation loop
  mainLoop();
}

// Add event listeners for scaling
const scalingForm = document.getElementById("scaling-form");
if (scalingForm) {
  scalingForm.addEventListener("submit", applyScaling);
} else {
  console.warn('Scaling form not found');
}

// Add event listener for reset button
const resetButton = document.getElementById("reset-scaling");
if (resetButton) {
  resetButton.addEventListener("click", resetToDefaultScaling);
} else {
  console.warn('Reset button not found');
}

// Add event listeners for shape addition and editing
const addShapeForm = document.getElementById("add-shape-form");
if (addShapeForm) {
  addShapeForm.addEventListener("submit", handleShapeAddition);
} else {
  console.warn('Add shape form not found');
}

if (spanEditModal) {
  spanEditModal.onclick = function () {
    if (modalEdit) modalEdit.style.display = "none";
  };
}

// Add event listener for the add shape button
const addShapeBtn = document.getElementById("add-shape-btn");
if (addShapeBtn && modalAdd) {
  addShapeBtn.onclick = function () {
    modalAdd.style.display = "block";
    if (addButton) {
      addButton.removeEventListener("click", handleShapeAddition);
      addButton.addEventListener("click", handleShapeAddition);
    }
  };
} else {
  console.warn('Add shape button or modal not found');
}

// Reset all button click handler
const resetAllBtn = document.getElementById('reset-all-btn');
if (resetAllBtn) {
  resetAllBtn.addEventListener('click', function() {
    window.location.reload();
  });
} else {
  console.warn('Reset all button not found');
}

// Modal close button handlers
const closeButtons = document.querySelectorAll('.close');
if (closeButtons.length > 0) {
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (modalAdd) modalAdd.style.display = "none";
      if (modalEdit) modalEdit.style.display = "none";
    });
  });
} else {
  console.warn('No close buttons found');
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
  if (event.target === modalAdd) {
    modalAdd.style.display = "none";
  }
  if (event.target === modalEdit) {
    modalEdit.style.display = "none";
  }
});

function updateMouseButtons() {
  let leftMouse = MOUSE.PAN; // Default behavior (panning with left mouse)
  let middleMouse = MOUSE.DOLLY; // Default behavior (zooming with middle mouse)
  let rightMouse = MOUSE.ROTATE; // Default behavior (rotation with right mouse)

  // If lockVertices is checked, disable LEFT (no panning)
  if (lockVertices.checked) {
    leftMouse = null; // Disable left mouse button (no panning)
  }

  // If lockZoom is checked, prevent MIDDLE (no zooming)
  if (lockZoom.checked) {
    middleMouse = null; // Disable middle mouse button (no zooming)
    orbit.enableZoom = false; // Disable zoom functionality
  } else {
    orbit.enableZoom = true; // Enable zoom if lockZoom is unchecked
  }

  // If lockRotate is checked, disable RIGHT (no rotating)
  if (lockRotate.checked) {
    rightMouse = null; // Disable right mouse button (no rotating)
  }

  // Update the mouse buttons based on the checkbox states
  orbit.mouseButtons = {
    LEFT: leftMouse,
    MIDDLE: middleMouse,
    RIGHT: rightMouse,
  };

  // Ensure smooth damping and set target
  orbit.target.set(0, 0, 0);
  orbit.dampingFactor = 0.05;
  orbit.enableDamping = true;

  // Force an update on the controls
  orbit.update();
}

function updateShapeList(shapeList) {
  const shapeListDiv = document.getElementById("shape-list");
  if (!shapeListDiv) return;
  
  shapeListDiv.innerHTML = ""; // Clear previous list

  const ul = document.createElement("ul");

  shapeList.forEach((shape) => {
    const li = document.createElement("li");
    const isSelected = shapes.find(s => s.userData.id === shape.id)?.userData.selected;

    li.innerHTML = `
      <div class="shape-info">
        <span class="shape-id">${shape.id}</span>
        <span class="coordinates">(${shape.x.toFixed(2)}, ${shape.y.toFixed(2)}, ${shape.z.toFixed(2)})</span>
      </div>
      <div class="button-group">
        <button class="select-btn ${isSelected ? 'shape-selected' : ''}" data-name="${shape.id}">
          ${isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    `;
    ul.appendChild(li);
  });

  shapeListDiv.appendChild(ul);

  // Attach event listeners for Select buttons
  document.querySelectorAll(".select-btn").forEach((button) => {
    button.addEventListener("click", handleSelect);
  });
}

// Add event listeners for global shape control buttons
if (editButton) {
  console.log('Edit button found:', editButton);
  editButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent form submission
    console.log('Edit button clicked');
    const selectedShape = shapes.find(shape => shape.userData.selected);
    console.log('Selected shape:', selectedShape);
    if (selectedShape) {
      console.log('Opening edit modal for shape:', selectedShape.userData.id);
      handleEdit(selectedShape, null, [selectedShape.position.x, selectedShape.position.y, selectedShape.position.z]);
    } else {
      console.warn('No shape selected for editing');
      alert("Please select a shape first");
    }
  });
} else {
  console.error('Edit button not found in DOM');
}

// Add event listener for delete button
const deleteButton = document.getElementById("delete-shape-btn");
if (deleteButton) {
  console.log('Delete button found:', deleteButton);
  deleteButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent form submission
    console.log('Delete button clicked');
    const selectedShape = shapes.find(shape => shape.userData.selected);
    console.log('Selected shape for deletion:', selectedShape);
    if (selectedShape) {
      console.log('Deleting shape:', selectedShape.userData.id);
      handleDelete(selectedShape, null, [selectedShape.position.x, selectedShape.position.y, selectedShape.position.z]);
    } else {
      console.warn('No shape selected for deletion');
      alert("Please select a shape first");
    }
  });
} else {
  console.error('Delete button not found in DOM');
}

function createLabel(text, position) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  context.font = 'Bold 40px Arial';
  context.fillStyle = 'white';
  context.fillText(text, 0, 40);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(2, 0.5, 1);
  return sprite;
}

// Instructions toggle handlers
const toggleInstructions = document.getElementById("toggle-instructions");
const procedureMessage = document.getElementById("procedure-message");

// Function to show the instructions overlay
const showInstructions = () => {
  procedureMessage.style.display = "block";
};

// Function to hide the instructions overlay
const hideInstructions = (event) => {
  // Close if click is outside the overlay or if it's the toggle button again
  if (
    !procedureMessage.contains(event.target) &&
    event.target !== toggleInstructions
  ) {
    procedureMessage.style.display = "none";
  }
};

// Attach event listeners
toggleInstructions.addEventListener("click", (event) => {
  // Toggle the visibility of the overlay
  if (procedureMessage.style.display === "block") {
    procedureMessage.style.display = "none";
  } else {
    showInstructions();
  }
  event.stopPropagation(); // Prevent immediate closure after clicking the button
});

document.addEventListener("click", hideInstructions);

// Prevent closing the overlay when clicking inside it
procedureMessage.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent the click inside from closing the overlay
});

function handleShapeAddition() {
  let xcoord = parseFloat(document.getElementById("x1").value);
  let ycoord = parseFloat(document.getElementById("y1").value);
  let zcoord = parseFloat(document.getElementById("z1").value);
  
  if (isNaN(xcoord) || isNaN(ycoord) || isNaN(zcoord)) {
    console.error("Invalid coordinate input");
    return;
  }

  noOfShapes++;

  const shapeType = document.getElementById("shape-add-dropdown").value;

  if (shapeType === "Cube") {
    createCube(
      xcoord,
      ycoord,
      zcoord,
      shapes,
      shapeList,
      shapeCount,
      scene,
      point,
      shapeVertex,
      dragX,
      dragY,
      dragZ
    );
  } else if (shapeType === "Tetrahedron") {
    createTetrahedron(
      xcoord,
      ycoord,
      zcoord,
      shapes,
      shapeList,
      shapeCount,
      scene,
      point,
      shapeVertex,
      dragX,
      dragY,
      dragZ
    );
  } else if (shapeType === "Octahedron") {
    createOctahedron(
      xcoord,
      ycoord,
      zcoord,
      shapes,
      shapeList,
      shapeCount,
      scene,
      point,
      shapeVertex,
      dragX,
      dragY,
      dragZ
    );
  }
  updateShapeList(shapeList); // Update the UI
  modalAdd.style.display = "none";
}

function handleDelete(shape, line, coordsArray) {
  console.log('handleDelete called for shape:', shape.userData.id);
  if (!shape) {
    console.error('No shape provided for deletion');
    return;
  }

  // Remove from scene
  console.log('Removing shape from scene');
  scene.remove(shape);
  if (line) scene.remove(line);

  // Remove from arrays
  const shapeId = shape.userData.id;
  shapes = shapes.filter(s => s.userData.id !== shapeId);
  shapeList = shapeList.filter(s => s.id !== shapeId);
  noOfShapes--;

  // Update UI
  updateShapeList(shapeList);
  console.log('Shape deletion complete');
}

function handleEdit(shape, line, coordsArray) {
  console.log('handleEdit called for shape:', shape.userData.id);
  const editModal = document.getElementById("edit-modal");
  if (!editModal) {
    console.error("Edit modal not found");
    return;
  }

  // Store the shape ID and coordinates
  editModal.dataset.shapeId = shape.userData.id;
  editModal.dataset.coords = JSON.stringify(coordsArray);
  console.log('Stored shape data in modal:', {
    id: shape.userData.id,
    coords: coordsArray
  });

  // Fill the modal fields
  document.getElementById("x").value = shape.position.x;
  document.getElementById("y").value = shape.position.y;
  document.getElementById("z").value = shape.position.z;
  document.getElementById("shape-edit-dropdown").value = shape.name;

  // Show the modal
  editModal.style.display = "block";
  console.log('Edit modal displayed');

  // Add event listener for the edit confirmation button
  const editConfirmButton = document.getElementById("modalBox_addsubmit");
  if (editConfirmButton) {
    console.log('Found edit confirmation button');
    editConfirmButton.onclick = (event) => {
      event.preventDefault();
      handleEditConfirmation();
    };
  } else {
    console.error('Edit confirmation button not found');
  }
}

// Function to handle edit confirmation
function handleEditConfirmation() {
  console.log('handleEditConfirmation called');
  const editModal = document.getElementById("edit-modal");
  if (!editModal) {
    console.error('Edit modal not found');
    return;
  }

  const shapeId = editModal.dataset.shapeId;
  const coordsArray = JSON.parse(editModal.dataset.coords);
  console.log('Processing edit for shape:', shapeId);
  
  // Get new values
  const xcoord = parseFloat(document.getElementById("x").value);
  const ycoord = parseFloat(document.getElementById("y").value);
  const zcoord = parseFloat(document.getElementById("z").value);
  const shapeType = document.getElementById("shape-edit-dropdown").value;

  console.log('New coordinates:', { x: xcoord, y: ycoord, z: zcoord, type: shapeType });

  if (isNaN(xcoord) || isNaN(ycoord) || isNaN(zcoord)) {
    console.error("Invalid coordinate input");
    return;
  }

  // Find and remove the old shape
  const oldShape = shapes.find(s => s.userData.id === shapeId);
  if (oldShape) {
    console.log('Removing old shape');
    scene.remove(oldShape);
    shapes = shapes.filter(s => s.userData.id !== shapeId);
    shapeList = shapeList.filter(s => s.id !== shapeId);
  } else {
    console.warn('Old shape not found for ID:', shapeId);
  }

  // Create new shape
  const createShape = {
    Cube: createCube,
    Tetrahedron: createTetrahedron,
    Octahedron: createOctahedron
  }[shapeType];

  if (createShape) {
    console.log('Creating new shape of type:', shapeType);
    createShape(
      xcoord,
      ycoord,
      zcoord,
      shapes,
      shapeList,
      shapeCount,
      scene,
      point,
      shapeVertex,
      dragX,
      dragY,
      dragZ
    );
  } else {
    console.error('Invalid shape type:', shapeType);
  }

  updateShapeList(shapeList);
  editModal.style.display = "none";
  console.log('Edit operation complete');
}

// Constants for default scaling values
const DEFAULT_SCALE_X = 1;
const DEFAULT_SCALE_Y = 1;
const DEFAULT_SCALE_Z = 1;

// Function to update the matrix display
function updateMatrixDisplay() {
  console.log('Updating matrix display');
  
  // Get current scaling values from the transformation matrix
  const scaleX = trans_matrix.elements[0].toFixed(2);
  const scaleY = trans_matrix.elements[5].toFixed(2);
  const scaleZ = trans_matrix.elements[10].toFixed(2);
  
  console.log('Current matrix values:', {
    scaleX,
    scaleY,
    scaleZ,
    fullMatrix: Array.from(trans_matrix.elements).map(v => v.toFixed(2))
  });
  
  // Update the matrix input boxes
  document.getElementById('matrix-00').value = scaleX;
  document.getElementById('matrix-11').value = scaleY;
  document.getElementById('matrix-22').value = scaleZ;
  
  // Set non-diagonal elements to 0
  document.getElementById('matrix-01').value = '0';
  document.getElementById('matrix-02').value = '0';
  document.getElementById('matrix-03').value = '0';
  document.getElementById('matrix-10').value = '0';
  document.getElementById('matrix-12').value = '0';
  document.getElementById('matrix-13').value = '0';
  document.getElementById('matrix-20').value = '0';
  document.getElementById('matrix-21').value = '0';
  document.getElementById('matrix-23').value = '0';
  document.getElementById('matrix-30').value = '0';
  document.getElementById('matrix-31').value = '0';
  document.getElementById('matrix-32').value = '0';
  document.getElementById('matrix-33').value = '1';
}

// Function to reset matrix to identity
function resetMatrixToIdentity() {
  trans_matrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );
  updateMatrixDisplay();
}

// Function to apply scaling using transformation matrix
function applyScaling(event) {
  event.preventDefault();
  console.log('Applying scaling');
  
  // Check if any shape is selected
  const selectedShape = shapes.find(shape => shape.userData.selected);
  if (!selectedShape) {
    console.warn('No shape selected');
    alert("Please select a shape first");
    return;
  }
  
  // Get scaling values from form
  max_x_scale = parseFloat(document.getElementById("scale-x").value);
  max_y_scale = parseFloat(document.getElementById("scale-y").value);
  max_z_scale = parseFloat(document.getElementById("scale-z").value);
  
  console.log('Scaling values:', {
    x: max_x_scale,
    y: max_y_scale,
    z: max_z_scale
  });
  
  // Update the scaling matrix
  trans_matrix.set(
    max_x_scale, 0, 0, 0,
    0, max_y_scale, 0, 0,
    0, 0, max_z_scale, 0,
    0, 0, 0, 1
  );
  
  console.log('Updated transformation matrix:', {
    elements: Array.from(trans_matrix.elements).map(v => v.toFixed(2))
  });
  
  // Update the matrix display
  updateMatrixDisplay();
  
  // Reset slider to start position
  if (slider) {
    slider.value = 0;
  }
  
  // Reset old scale values
  old_scale = [1, 1, 1];
  
  // Apply scaling to selected shapes using the matrix
  shapes.forEach((shape) => {
    if (shape.userData.selected) {
      // Apply the transformation matrix
      shape.matrix.copy(trans_matrix);
      shape.matrix.decompose(shape.position, shape.quaternion, shape.scale);
      shape.updateMatrix();
    }
  });
}

// Function to move point based on slider value
function movePoint(e) {
  console.log('Slider moved:', e.target.value);
  const sliderValue = parseFloat(e.target.value) / 1000;
  console.log('Normalized slider value:', sliderValue);
  
  // Only scale selected shapes
  shapes.forEach((shape, index) => {
    if (shape.userData.selected) {
      console.log('Processing selected shape:', shape.userData.id);
      
      // Calculate new scale based on slider value
      const newScaleX = old_scale[0] + (max_x_scale - old_scale[0]) * sliderValue;
      const newScaleY = old_scale[1] + (max_y_scale - old_scale[1]) * sliderValue;
      const newScaleZ = old_scale[2] + (max_z_scale - old_scale[2]) * sliderValue;
      
      console.log('New scale values:', {
        x: newScaleX,
        y: newScaleY,
        z: newScaleZ
      });
      
      // Update shape scale
      shape.scale.set(newScaleX, newScaleY, newScaleZ);
      
      // Update transformation matrix with current scaling values
      trans_matrix.set(
        newScaleX, 0, 0, 0,
        0, newScaleY, 0, 0,
        0, 0, newScaleZ, 0,
        0, 0, 0, 1
      );
      
      console.log('Updated transformation matrix:', {
        elements: Array.from(trans_matrix.elements).map(v => v.toFixed(2))
      });
      
      // Update matrix display in real-time
      updateMatrixDisplay();
      
      // Update result coordinates display
      const resultCoords = document.getElementById('result-coordinates');
      if (resultCoords) {
        resultCoords.textContent = `Result: Scale(${newScaleX.toFixed(2)}, ${newScaleY.toFixed(2)}, ${newScaleZ.toFixed(2)})`;
      }
    }
  });
}

// Function to reset scaling values to defaults
function resetToDefaultScaling() {
  document.getElementById("scale-x").value = DEFAULT_SCALE_X;
  document.getElementById("scale-y").value = DEFAULT_SCALE_Y;
  document.getElementById("scale-z").value = DEFAULT_SCALE_Z;
  
  // Reset old scale values
  old_scale = [DEFAULT_SCALE_X, DEFAULT_SCALE_Y, DEFAULT_SCALE_Z];
  
  // Reset slider
  slider.value = 0;
  
  // Reset matrix to identity
  resetMatrixToIdentity();
  
  // Reset shapes to their original size
  shapes.forEach((shape, index) => {
    if (shape.userData.selected) {
      shape.scale.set(DEFAULT_SCALE_X, DEFAULT_SCALE_Y, DEFAULT_SCALE_Z);
    }
  });
}

// Initialize matrix display when the page loads
window.addEventListener('load', () => {
  resetMatrixToIdentity();
});

// Update mobile view settings
function updateMobileView() {
const isMobile = window.innerWidth <= 800;
  console.log('Updating view for device:', isMobile ? 'mobile' : 'desktop');
  console.log('Window dimensions:', {
    width: window.innerWidth,
    height: window.innerHeight
  });
  
if (isMobile) {
    // Adjust camera for mobile view
    camera.fov = 90; // Wider field of view for mobile
    camera.position.set(12, 12, 12); // Closer position
    camera.lookAt(0, 0, 0); // Look at center
    console.log('Mobile camera settings:', {
      fov: camera.fov,
      position: camera.position,
      lookAt: new THREE.Vector3(0, 0, 0)
    });
} else {
    // Desktop view settings
    camera.fov = 30;
    camera.position.set(25, 25, 25);
    camera.lookAt(10, 10, 5);
    console.log('Desktop camera settings:', {
      fov: camera.fov,
      position: camera.position,
      lookAt: new THREE.Vector3(10, 10, 5)
    });
  }
  camera.updateProjectionMatrix();
  console.log('Camera update complete');
}

// Add window resize handler with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateMobileView, 250);
});

// Shape selection handler
function handleSelect(event) {
  console.log('Select button clicked:', event.target.dataset.name);
  const shapeId = event.target.dataset.name;
  const selectedShape = shapes.find(shape => shape.userData.id === shapeId);
  console.log('Found shape:', selectedShape);
  
  if (selectedShape) {
    console.log('Deselecting all shapes');
    // Deselect all shapes
    shapes.forEach(shape => {
      shape.userData.selected = false;
      if (shape.userData.outline) {
        shape.remove(shape.userData.outline);
        shape.userData.outline = null;
      }
    });

    console.log('Selecting shape:', shapeId);
    // Select the clicked shape
    selectedShape.userData.selected = true;
    
    // Create outline based on shape type
    let outlineGeometry;
    switch(selectedShape.name) {
      case 'Cube':
        outlineGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        break;
      case 'Tetrahedron':
        outlineGeometry = new THREE.TetrahedronGeometry(1.2);
        break;
      case 'Octahedron':
        outlineGeometry = new THREE.OctahedronGeometry(1.2);
        break;
      default:
        outlineGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    }
    
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.5
    });
    
    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
    selectedShape.add(outline);
    selectedShape.userData.outline = outline;

    // Update edit modal with shape's current position
    document.getElementById('x').value = selectedShape.position.x;
    document.getElementById('y').value = selectedShape.position.y;
    document.getElementById('z').value = selectedShape.position.z;
    document.getElementById('shape-edit-dropdown').value = selectedShape.name;

    // Update result coordinates display
    const resultCoords = document.getElementById('result-coordinates');
    if (resultCoords) {
      resultCoords.textContent = `Result: (${selectedShape.position.x.toFixed(2)}, ${selectedShape.position.y.toFixed(2)}, ${selectedShape.position.z.toFixed(2)})`;
    }

    // Update button state
    const selectBtn = event.target;
    selectBtn.classList.add('shape-selected');
    selectBtn.textContent = 'Selected';
    console.log('Shape selection complete');
  } else {
    console.warn('Shape not found for ID:', shapeId);
  }
}
