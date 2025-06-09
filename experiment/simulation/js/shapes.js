"use strict";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js";
import { createMaterials } from "./materials.js";

// function updateShapeList(shapeList) {
//   const shapeListDiv = document.getElementById("shape-list");
//   shapeListDiv.innerHTML = ""; // Clear previous list

//   const ul = document.createElement("ul");

//   shapeList.forEach((shape) => {
//     const li = document.createElement("li");

//     li.innerHTML = `
//       <div class="shape-info">
//         <span class="shape-id">${shape.id}</span>
//         <span class="coordinates">(${shape.x}, ${shape.y}, ${shape.z})</span>
//       </div>
//       <div class="button-group">
//         <button class="select-btn"
//                 data-name="${shape.id}"
//                 data-coordinates="${shape.x},${shape.y},${shape.z}">
//           Select
//         </button>
//         <button class="edit-btn"
//                 data-name="${shape.id}"
//                 data-coordinates="${shape.x},${shape.y},${shape.z}">
//           Edit
//         </button>
//         <button class="delete-btn"
//                 data-name="${shape.id}"
//                 data-coordinates="${shape.x},${shape.y},${shape.z}">
//           Delete
//         </button>
//       </div>
//     `;
//     ul.appendChild(li);
//   });

//   shapeListDiv.appendChild(ul);

//   // Attach event listeners for Select, Edit, and Delete buttons
//   document.querySelectorAll(".select-btn").forEach((button) => {
//     button.addEventListener("click", handleSelect, false);
//   });

//   document.querySelectorAll(".edit-btn").forEach((button) => {
//     button.addEventListener("click", handleEdit, false);
//   });

//   document.querySelectorAll(".delete-btn").forEach((button) => {
//     button.addEventListener("click", handleDelete, false);
//   });
// }

// function handleSelect(event) {
//   const shapeName = event.target.getAttribute("data-name");
//   const shapeCoordinates = event.target.getAttribute("data-coordinates");

//   console.log(`Shape Selected: ${shapeName}`);
//   console.log(`Coordinates: ${shapeCoordinates}`);
// }

// function handleEdit(event) {
//   const shapeName = event.target.getAttribute("data-name");
//   const shapeCoordinates = event.target.getAttribute("data-coordinates");

//   console.log(`Editing Shape: ${shapeName}`);
//   console.log(`Coordinates: ${shapeCoordinates}`);

//   // Implement editing logic here, e.g., open a modal for editing
// }

// function handleDelete(event) {
//   const shapeName = event.target.getAttribute("data-name");
//   const shapeCoordinates = event.target.getAttribute("data-coordinates");

//   console.log(`Deleting Shape: ${shapeName}`);
//   console.log(`Coordinates: ${shapeCoordinates}`);

//   // Implement deletion logic here, e.g., remove the shape from shapeList
// }

export const createCube = function (
  x,
  y,
  z,
  shapes,
  shapeList,
  shapeCount,
  scene,
  point,
  shapeVertex,
  dragX,
  dragY,
  dragZ
) {
  const geometry = new THREE.BoxGeometry(1);
  const material = createMaterials().cubeShader;
  const cub = new THREE.Mesh(geometry, material);

  cub.position.x = x;
  cub.position.y = y;
  cub.position.z = z;
  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = createMaterials().cubeShader;
  // const cub = new THREE.Mesh(geometry, material);
  // cub.geometry.verticesNeedUpdate = true;
  shapes.push(cub);
  shapes[shapes.length - 1].position.set(x, y, z);
  scene.add(shapes[shapes.length - 1]);
  shapes[shapes.length - 1].name = "Cube";

  // Add to shapeList with cubeCounter
  shapeList.push({
    id: `Cube-${shapeCount[0]}`,
    // name: "Cube",
    x: parseInt(x, 10), // Convert to integer
    y: parseInt(y, 10), // Convert to integer
    z: parseInt(z, 10), // Convert to integer
  });
  console.log(typeof x, typeof y, typeof z);

  shapeCount[0]++;
  // Highlight edges
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  shapes[shapes.length - 1].add(edges);

  let verticesList = shapes[shapes.length - 1].geometry.vertices;
  let i = 0;
  verticesList.forEach((vertex) => {
    let dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(vertex);
    let dotMaterial = new THREE.PointsMaterial({
      color: "white",
      size: 6,
      sizeAttenuation: false,
    });
    // const geometry = new THREE.SphereGeometry(15, 32, 16);
    let dot = new THREE.Points(dotGeometry, dotMaterial);
    point.push(dot);
    // shapes[shapes.length - 1].add(point[point.length - 1]);
    if (i === 0) {
      shapeVertex.push(dot);
    }
    i++;
  });

  dragX.push(shapes[shapes.length - 1].geometry.vertices[0].x);
  dragY.push(shapes[shapes.length - 1].geometry.vertices[0].y);
  dragZ.push(shapes[shapes.length - 1].geometry.vertices[0].z);
  // updateShapeList(shapeList); // Update the UI
};

export const createDodecahedron = function (
  x,
  y,
  z,
  shapes,
  shapeList,
  shapeCount,
  scene,
  point,
  shapeVertex,
  dragX,
  dragY,
  dragZ
) {
  const geometry = new THREE.DodecahedronGeometry(1);
  const material = createMaterials().cubeShader;
  const cub = new THREE.Mesh(geometry, material);
  cub.geometry.verticesNeedUpdate = true;
  // cub.name = "Dodecahedron";
  shapes.push(cub);
  shapes[shapes.length - 1].position.set(x, y, z);
  shapes[shapes.length - 1].name = "Dodecahedron";
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });

  shapeList.push({
    id: `Dodecahedron-${shapeCount[1]++}`,
    // name: "Dodecahedron",
    x: parseInt(x, 10), // Convert to integer
    y: parseInt(y, 10), // Convert to integer
    z: parseInt(z, 10), // Convert to integer
  });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  shapes[shapes.length - 1].add(edges);
  scene.add(shapes[shapes.length - 1]);
  for (let i = 0; i < shapes[shapes.length - 1].geometry.vertices.length; i++) {
    const dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(shapes[shapes.length - 1].geometry.vertices[i]);
    const dotMaterial = new THREE.PointsMaterial({
      color: "white",
      size: 6,
      sizeAttenuation: false,
    });
    const dot = new THREE.Points(dotGeometry, dotMaterial);
    point.push(dot);
    // shapes[shapes.length - 1].add(point[point.length - 1]);
    if (i === 0) {
      shapeVertex.push(dot);
    }
  }
  dragX.push(shapes[shapes.length - 1].geometry.vertices[0].x);
  dragY.push(shapes[shapes.length - 1].geometry.vertices[0].y);
  dragZ.push(shapes[shapes.length - 1].geometry.vertices[0].z);
  // updateShapeList(shapeList); // Update the UI
};

export const createOctahedron = function (
  x,
  y,
  z,
  shapes,
  shapeList,
  shapeCount,
  scene,
  point,
  shapeVertex,
  dragX,
  dragY,
  dragZ
) {
  const geometry = new THREE.OctahedronGeometry(1);
  const material = createMaterials().cubeShader;
  const cub = new THREE.Mesh(geometry, material);
  cub.geometry.verticesNeedUpdate = true;
  shapes.push(cub);
  shapes[shapes.length - 1].position.set(x, y, z);

  // Add to shapeList with octahedronCounter
  shapeList.push({
    id: `Octahedron-${shapeCount[2]++}`,
    // name: "Octahedron",
    x: parseInt(x, 10), // Convert to integer
    y: parseInt(y, 10), // Convert to integer
    z: parseInt(z, 10), // Convert to integer
  });
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  shapes[shapes.length - 1].add(edges);
  scene.add(shapes[shapes.length - 1]);
  shapes[shapes.length - 1].name = "Octahedron";
  for (let i = 0; i < shapes[shapes.length - 1].geometry.vertices.length; i++) {
    const dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(shapes[shapes.length - 1].geometry.vertices[i]);
    const dotMaterial = new THREE.PointsMaterial({
      color: "white",
      size: 6,
      sizeAttenuation: false,
    });
    const dot = new THREE.Points(dotGeometry, dotMaterial);
    point.push(dot);
    // shapes[shapes.length - 1].add(point[point.length - 1]);
    if (i === 0) {
      shapeVertex.push(dot);
    }
  }
  dragX.push(shapes[shapes.length - 1].geometry.vertices[0].x);
  dragY.push(shapes[shapes.length - 1].geometry.vertices[0].y);
  dragZ.push(shapes[shapes.length - 1].geometry.vertices[0].z);
  // updateShapeList(shapeList); // Update the UI
};

export const createTetrahedron = function (
  x,
  y,
  z,
  shapes,
  shapeList,
  shapeCount,
  scene,
  point,
  shapeVertex,
  dragX,
  dragY,
  dragZ
) {
  console.log("Creating Tetrahedron at: ", x, y, z); // Add this line to debug

  const geometry = new THREE.TetrahedronGeometry(1);
  const material = createMaterials().cubeShader;
  const cub = new THREE.Mesh(geometry, material);
  cub.geometry.verticesNeedUpdate = true;
  shapes.push(cub);
  shapes[shapes.length - 1].position.set(x, y, z);

  shapeList.push({
    id: `Tetrahedron-${shapeCount[3]++}`,
    // name: "Tetrahedron",
    x: parseInt(x, 10), // Convert to integer
    y: parseInt(y, 10), // Convert to integer
    z: parseInt(z, 10), // Convert to integer
  });
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  shapes[shapes.length - 1].add(edges);
  scene.add(shapes[shapes.length - 1]);
  shapes[shapes.length - 1].name = "Tetrahedron";
  for (let i = 0; i < shapes[shapes.length - 1].geometry.vertices.length; i++) {
    const dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(shapes[shapes.length - 1].geometry.vertices[i]);
    const dotMaterial = new THREE.PointsMaterial({
      color: "white",
      size: 6,
      sizeAttenuation: false,
    });
    const dot = new THREE.Points(dotGeometry, dotMaterial);
    point.push(dot);
    // shapes[shapes.length - 1].add(point[point.length - 1]);
    if (i === 0) {
      shapeVertex.push(dot);
    }
  }
  dragX.push(shapes[shapes.length - 1].geometry.vertices[0].x);
  dragY.push(shapes[shapes.length - 1].geometry.vertices[0].y);
  dragZ.push(shapes[shapes.length - 1].geometry.vertices[0].z);
  // updateShapeList(shapeList); // Update the UI
};
