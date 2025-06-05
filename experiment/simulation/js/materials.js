"use strict";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js";

function vertexShader() {
    return `varying vec3 vUv; 
            varying vec3 vPosition;
      
            void main() {
                vUv = position; 
                vPosition = position;
      
                vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewPosition; 
            }`;
}

function fragmentShader() {
    return `uniform vec3 colorA; 
            uniform vec3 colorB; 
            uniform float highlightIntensity;
            varying vec3 vUv;
            varying vec3 vPosition;
      
            void main() {
                vec3 baseColor = mix(colorA, colorB, vUv.z);
                vec3 highlightColor = vec3(0.4, 0.4, 0.4); // Gray highlight
                vec3 finalColor = mix(baseColor, highlightColor, highlightIntensity);
                gl_FragColor = vec4(finalColor, 1.0);
            }`;
}

// Create materials using shaders
export function createMaterials() {
  const materials = {};

  // Cube material
  materials.cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });

  // Tetrahedron material
  materials.tetrahedronMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });

  // Octahedron material
  materials.octahedronMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });

  return materials;
}

// Initialize materials at module level
export const materials = createMaterials();

// Add camera settings for mobile view
export function getCameraSettings() {
    const isMobile = window.innerWidth <= 800;
    return {
        position: isMobile ? new THREE.Vector3(15, 15, 15) : new THREE.Vector3(25, 25, 25),
        fov: isMobile ? 45 : 30,
        near: 0.1,
        far: 1000,
        aspect: window.innerWidth / window.innerHeight
    };
}
