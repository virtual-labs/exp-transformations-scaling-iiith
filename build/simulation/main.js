"use strict";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js";
import { MOUSE } from "https://unpkg.com/three@0.128.0/build/three.module.js";

import {
  createCube,
  createDodecahedron,
  createOctahedron,
  createTetrahedron,
} from "./js/shapes.js";
import { Triangle } from "./js/Triangle.js";

const moveButton = document.getElementById("move-button");
const modalbutton1 = document.querySelector(".edit-button");
const modalbutton2 = document.querySelector(".add-button");
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
var slider = document.getElementById("slider");
slider.addEventListener("input", movePoint);
document.getElementById("slider").max = 1000;
document.getElementById("slider").min = 0;
slider.step = 1;

let max_x_scale = document.getElementById("scale-x").value;
let max_y_scale = document.getElementById("scale-y").value;
let max_z_scale = document.getElementById("scale-z").value;

let old_scale = [1, 1, 1];

let noofframes = 1000;
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
  dragz = [],
  shapeList = [],
  lock = 0,
  dir = [],
  arrowHelper = [];

let point = [];
let shapeVertex = [];
let dotList = [];
let noOfShapes = 0;

let trans_matrix = new THREE.Matrix4();
trans_matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

let shapeCount = [0, 0, 0, 0];

// Modal controls for Add Shape Button
let addModal = document.getElementById("add-modal");
let spanAddModal = document.getElementsByClassName("close")[1];

spanAddModal.onclick = function () {
  addModal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === addModal) {
    addModal.style.display = "none";
  }
};

lockVertices.addEventListener("click", updateMouseButtons);
lockZoom.addEventListener("click", updateMouseButtons);
lockRotate.addEventListener("click", updateMouseButtons);

function updateMouseButtons() {
  let leftMouse = MOUSE.PAN; // Default behavior (panning with left mouse)
  let middleMouse = MOUSE.PAN; // Set middle mouse to MOUSE.PAN but it will do nothing
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
yzGrid.addEventListener("click", () => {
  if (yzGrid.checked) {
    let grid = new THREE.GridHelper(size, divisions);
    grid.geometry.rotateZ(PI / 2);
    // grid.lookAt(vector3);
    yzgrid.push(grid);
    scene.add(yzgrid[0]);
  } else {
    scene.remove(yzgrid[0]);
    yzgrid.pop();
  }
});

function updateShapeList(shapeList) {
  const shapeListDiv = document.getElementById("shape-list");
  shapeListDiv.innerHTML = ""; // Clear previous list

  const ul = document.createElement("ul");

  shapeList.forEach((shape) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="shape-info">
        <span class="shape-id">${shape.id}</span>
        <span class="coordinates">(${shape.x}, ${shape.y}, ${shape.z})</span>
      </div>
      <div class="button-group">
        <button class="select-btn" 
                data-name="${shape.id}" 
                data-coordinates="${shape.x},${shape.y},${shape.z}">
          Select
        </button>
        
      </div>
    `;
    ul.appendChild(li);
  });

  shapeListDiv.appendChild(ul);

  // Attach event listeners for Select, Edit, and Delete buttons
  document.querySelectorAll(".select-btn").forEach((button) => {
    button.addEventListener("click", handleSelect, false);
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", handleEdit, false);
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", handleDelete, false);
  });
}

function handleSelect(event) {
  const shapeName = event.target.getAttribute("data-name");
  const shapeCoordinates = event.target.getAttribute("data-coordinates");

  // Validate the selected shape data
  if (!shapeName || !shapeCoordinates) {
    console.error("Missing shape name or coordinates");
    return;
  }

  console.log(`Shape Selected: ${shapeName}`);
  console.log(`Coordinates: ${shapeCoordinates}`);

  // Safely parse coordinates
  let coordsArray;
  try {
    coordsArray = shapeCoordinates
      .replace(/[()]/g, "")
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    if (coordsArray.length !== 3 || coordsArray.some(isNaN)) {
      throw new Error("Invalid coordinate format");
    }
  } catch (error) {
    console.error("Error parsing coordinates:", error);
    return;
  }

  const shapePosition = new THREE.Vector3(
    coordsArray[0],
    coordsArray[1],
    coordsArray[2]
  );

  // Find the shape in the shapeList based on its coordinates
  const shape = shapes.find(
    (s) =>
      s.position.x == coordsArray[0] &&
      s.position.y == coordsArray[1] &&
      s.position.z == coordsArray[2]
  );

  if (!shape) {
    console.log("Shape not found in shapes.");
    return;
  }

  // Handle selection and deselection of shapes
  const existingLine = scene.getObjectByName("selection-line");

  if (existingLine && existingLine.position.equals(shapePosition)) {
    scene.remove(existingLine);
    console.log("Deselected the shape.");
    return;
  }

  // Remove existing selection line
  if (existingLine) {
    scene.remove(existingLine);
  }

  // Create a new selection line
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  line.position.set(shapePosition.x, shapePosition.y, shapePosition.z);
  line.name = "selection-line"; // Add a name for easy identification
  scene.add(line);
  console.log("Selection line created at shape's position.");

  // Get delete and edit buttons
  const deleteButton = document.getElementById("delete-shape-btn");
  const editButton = document.getElementById("edit-shape-btn");

  // Clear previous event listeners before setting them again
  deleteButton.onclick = () => handleDelete(shape, line, coordsArray);
  editButton.onclick = () => handleEdit(shape, line, coordsArray);
}

function handleDelete(shape, line, coordsArray) {
  // Remove the selected shape and line from the scene
  shapeList = shapeList.filter(
    (s) =>
      !(s.x == coordsArray[0] && s.y == coordsArray[1] && s.z == coordsArray[2])
  );

  shapes = shapes.filter(
    (s) =>
      !(
        s.position.x == coordsArray[0] &&
        s.position.y == coordsArray[1] &&
        s.position.z == coordsArray[2]
      )
  );
  scene.remove(line);
  scene.remove(shape);

  // Remove the shape from the shapeList based on coordinates

  updateShapeList(shapeList);
  console.log(`Shape deleted.`);
}

function handleEdit(shape, line, coordsArray) {
  const editModal = document.getElementById("edit-modal");
  editModal.style.display = "block";

  // Fill the modal fields with the current values of the shape
  const shapeTypeSelect = document.querySelector("select");
  document.getElementById("x").value = shape.position.x;
  document.getElementById("y").value = shape.position.y;
  document.getElementById("z").value = shape.position.z;
  shapeTypeSelect.value = shape.name; // Assuming shape.name holds the current shape type

  // Use a single event listener to handle edit confirmation
  const modalEditButton = document.querySelector(".edit-button");

  // Remove any previous listener to avoid duplication
  modalEditButton.removeEventListener("click", handleEditConfirmation);

  // Add the event listener
  modalEditButton.addEventListener("click", handleEditConfirmation);

  function handleEditConfirmation() {
    // Get new coordinates from the modal inputs
    const xcoord = parseFloat(document.getElementById("x").value);
    const ycoord = parseFloat(document.getElementById("y").value);
    const zcoord = parseFloat(document.getElementById("z").value);
    const shapeType = shapeTypeSelect.value;

    // Validate the new coordinates
    if (isNaN(xcoord) || isNaN(ycoord) || isNaN(zcoord)) {
      console.error("Invalid coordinate input");
      return;
    }

    // Remove the current shape and selection line from the scene
    scene.remove(line); // Remove selection line
    scene.remove(shape); // Remove the shape from the scene

    // Remove the current shape from shapeList
    shapeList = shapeList.filter(
      (s) =>
        !(
          s.x == coordsArray[0] &&
          s.y == coordsArray[1] &&
          s.z == coordsArray[2]
        )
    );

    shapes = shapes.filter(
      (s) =>
        !(
          s.position.x == coordsArray[0] &&
          s.position.y == coordsArray[1] &&
          s.position.z == coordsArray[2]
        )
    );

    // Create a new shape based on the selected type
    const createShape = {
      Cube: createCube,
      Tetrahedron: createTetrahedron,
      Octahedron: createOctahedron,
      Dodecahedron: createDodecahedron,
    }[shapeType];

    if (createShape) {
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
        dragz
      );
    } else {
      console.error("Invalid shape type");
      return;
    }

    // Update shapeList and the UI
    noOfShapes++;
    updateShapeList(shapeList);

    // Close the modal after saving the shape
    editModal.style.display = "none";

    // After edit confirmation, remove the event listener to avoid duplication on next clicks
    modalEditButton.removeEventListener("click", handleEditConfirmation);
  }
}

let buttons = document.getElementsByTagName("button");
const size = 50;
const divisions = 25;

document.getElementById("add-shape-btn").onclick = function () {
  addModal.style.display = "block";

  // First, remove any existing event listener before adding a new one
  modalbutton2.removeEventListener("click", handleShapeAddition);

  // Add the event listener for the modal button
  modalbutton2.addEventListener("click", handleShapeAddition);
};

// Function to handle shape addition
function handleShapeAddition() {
  let xcoord = document.getElementById("x1").value;
  let ycoord = document.getElementById("y1").value;
  let zcoord = document.getElementById("z1").value;
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
      dragz
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
      dragz
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
      dragz
    );
  } else if (shapeType === "Dodecahedron") {
    createDodecahedron(
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
      dragz
    );
  }
  updateShapeList(shapeList); // Update the UI
  addModal.style.display = "none";
}

function movePoint(e) {
  var target = e.target;

  let scale = [
    1 + (target.value / noofframes) * (max_x_scale - 1),
    1 + (target.value / noofframes) * (max_y_scale - 1),
    1 + (target.value / noofframes) * (max_z_scale - 1),
  ];

  let scale_m = new THREE.Matrix4();
  scale_m.makeScale(
    scale[0] / old_scale[0],
    scale[1] / old_scale[1],
    scale[2] / old_scale[2]
  );

  for (let i = 0; i < 3; i++) {
    old_scale[i] = scale[i];
  }

  trans_matrix.multiply(scale_m);

  shapes.forEach((shape) => {
    shape.geometry.applyMatrix4(scale_m);

    // Update geometry attributes
    if (shape.geometry.isBufferGeometry) {
      shape.geometry.attributes.position.needsUpdate = true;
      shape.geometry.computeBoundingBox(); // Only if bounding box is needed
      shape.geometry.computeVertexNormals(); // Only if normals are affected
    }

    // Update edges
    shape.traverse((child) => {
      if (child.isLineSegments) {
        child.geometry.applyMatrix4(scale_m);
        if (child.geometry.isBufferGeometry) {
          child.geometry.attributes.position.needsUpdate = true;
        }
      }
    });
  });

  if (target.value <= 0) {
    trans_matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  if (parseFloat(e.target.value) === parseFloat(e.target.max)) {
    trans_matrix.set(
      max_x_scale,
      0,
      0,
      0,
      0,
      max_y_scale,
      0,
      0,
      0,
      0,
      max_z_scale,
      0,
      0,
      0,
      0,
      1
    );
  }

  document.getElementById("matrix-00").value = trans_matrix.elements[0];
  document.getElementById("matrix-01").value = trans_matrix.elements[1];
  document.getElementById("matrix-02").value = trans_matrix.elements[2];
  document.getElementById("matrix-03").value = trans_matrix.elements[3];

  document.getElementById("matrix-10").value = trans_matrix.elements[4];
  document.getElementById("matrix-11").value = trans_matrix.elements[5];
  document.getElementById("matrix-12").value = trans_matrix.elements[6];
  document.getElementById("matrix-13").value = trans_matrix.elements[7];

  document.getElementById("matrix-20").value = trans_matrix.elements[8];
  document.getElementById("matrix-21").value = trans_matrix.elements[9];
  document.getElementById("matrix-22").value = trans_matrix.elements[10];
  document.getElementById("matrix-23").value = trans_matrix.elements[11];

  document.getElementById("matrix-30").value = trans_matrix.elements[12];
  document.getElementById("matrix-31").value = trans_matrix.elements[13];
  document.getElementById("matrix-32").value = trans_matrix.elements[14];
  document.getElementById("matrix-33").value = trans_matrix.elements[15];
}

// document.getElementById("noofframes").onchange = function () {
//   let new_value = document.getElementById("noofframes").value;
//   let new_factor = [
//     noofframes / new_value,
//     noofframes / new_value,
//     noofframes / new_value,
//   ];

//   // Adjust old_scale only if necessary
//   for (let i = 0; i < 3; i++) {
//     if (old_scale[i] === 1) {
//       new_factor[i] = 1;
//     }
//   }

//   let scale_m = new THREE.Matrix4();
//   scale_m.makeScale(new_factor[0], new_factor[1], new_factor[2]);

//   // Update old_scale with the new value
//   for (let i = 0; i < 3; i++) {
//     old_scale[i] *= noofframes / new_value;
//   }

//   // Apply the scaling matrix to the transformation matrix
//   trans_matrix.multiply(scale_m);

//   // Update matrix values in the DOM
//   document.getElementById("matrix-00").value = trans_matrix.elements[0];
//   document.getElementById("matrix-11").value = trans_matrix.elements[5];
//   document.getElementById("matrix-22").value = trans_matrix.elements[10];

//   // Update the slider max value
//   document.getElementById("slider").max = new_value;
// };

document.getElementById("scale-x").onchange = function () {
  let new_scale = document.getElementById("scale-x").value;
  if (old_scale[0] !== 1) {
    let scale_m = new THREE.Matrix4();
    scale_m.makeScale(new_scale / max_x_scale, 1, 1);

    old_scale[0] *= new_scale / max_x_scale;
    trans_matrix.multiply(scale_m);
    document.getElementById("matrix-00").value = trans_matrix.elements[0];
  }

  max_x_scale = new_scale;
};
document.getElementById("scale-y").onchange = function () {
  let new_scale = document.getElementById("scale-y").value;
  if (old_scale[1] !== 1) {
    let scale_m = new THREE.Matrix4();
    scale_m.makeScale(1, new_scale / max_y_scale, 1);

    old_scale[1] *= new_scale / max_y_scale;
    trans_matrix.multiply(scale_m);
    document.getElementById("matrix-11").value = trans_matrix.elements[5];
  }

  max_y_scale = new_scale;
};
document.getElementById("scale-z").onchange = function () {
  let new_scale = document.getElementById("scale-z").value;
  if (old_scale[2] !== 1) {
    let scale_m = new THREE.Matrix4();
    scale_m.makeScale(1, 1, new_scale / max_z_scale);

    old_scale[2] *= new_scale / max_z_scale;
    trans_matrix.multiply(scale_m);
    document.getElementById("matrix-22").value = trans_matrix.elements[10];
  }

  max_z_scale = new_scale;
};

// // Function to reset slider to 0 and shape to original size
// function resetSliderAndShape() {
//   const slider = document.getElementById("slider"); // Get the slider element
//   slider.value = 0; // Reset slider to 0

//   // Reset shape scale to original size
//   shapes.forEach(shape => {
//     shape.scale.set(1, 1, 1);  // Reset shape scale to original (1,1,1)
//   });
// }

// // Add event listeners to X, Y, and Z scaling inputs
// document.getElementById("scale-x").addEventListener("input", resetSliderAndShape);
// document.getElementById("scale-y").addEventListener("input", resetSliderAndShape);
// document.getElementById("scale-z").addEventListener("input", resetSliderAndShape);

scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);
camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
let init = function () {
  camera.position.set(20, 20, 20); // Set camera position behind and above the origin

  camera.lookAt(10, 10, 5);
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);
  const gridHelper = new THREE.GridHelper(size, divisions);
  const count = 1;
  dir[0] = new THREE.Vector3(1, 0, 0);
  dir[1] = new THREE.Vector3(0, 1, 0);
  dir[2] = new THREE.Vector3(0, 0, 1);
  dir[3] = new THREE.Vector3(-1, 0, 0);
  dir[4] = new THREE.Vector3(0, -1, 0);
  dir[5] = new THREE.Vector3(0, 0, -1);
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 10;
  arrowHelper[0] = new THREE.ArrowHelper(dir[0], origin, length, "red");
  arrowHelper[1] = new THREE.ArrowHelper(dir[1], origin, length, "yellow");
  arrowHelper[2] = new THREE.ArrowHelper(dir[2], origin, length, "blue");
  arrowHelper[3] = new THREE.ArrowHelper(dir[3], origin, length, "red");
  arrowHelper[4] = new THREE.ArrowHelper(dir[4], origin, length, "yellow");
  arrowHelper[5] = new THREE.ArrowHelper(dir[5], origin, length, "blue");
  for (let i = 0; i < 6; i++) {
    scene.add(arrowHelper[i]);
  }

  createCube(
    5,
    1,
    0,
    shapes,
    shapeList,
    shapeCount,
    scene,
    point,
    shapeVertex,
    dragX,
    dragY,
    dragz
  );

  createTetrahedron(
    4,
    5,
    2,
    shapes,
    shapeList,
    shapeCount,
    scene,
    point,
    shapeVertex,
    dragX,
    dragY,
    dragz
  );
  updateShapeList(shapeList); // Update the UI

  // let tri_geo = Triangle(vertexA, vertexB, vertexC, scene, dotList);
  renderer = new THREE.WebGLRenderer();
  let w = container.offsetWidth;
  let h = container.offsetHeight;
  renderer.setSize(w, 0.85 * h);
  container.appendChild(renderer.domElement);
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  orbit.target.set(0, 0, 0);
  orbit.enableDamping = true;
};
let mainLoop = function () {
  orbit.update(); // Important for damping
  camera.updateMatrixWorld();
  renderer.render(scene, camera);
  requestAnimationFrame(mainLoop);
};
init();
mainLoop();
