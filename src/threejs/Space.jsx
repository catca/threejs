import React, { useRef } from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import {
  CubeTextureLoader,
  CubeCamera,
  WebGLCubeRenderTarget,
  RGBAFormat,
  LinearMipmapLinearFilter
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./styles.css";

extend({ OrbitControls });

const CameraControls = () => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls class.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls

  const {
    camera,
    gl: { domElement }
  } = useThree();

  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef();
  useFrame(() => controls.current.update());
  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      autoRotate={true}
      enableZoom={false}
    />
  );
};

// Loads the skybox texture and applies it to the scene.
function SkyBox() {
  const { scene } = useThree();
  const loader = new CubeTextureLoader();
  // The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
  const texture = loader.load([
    "img/1.jpg",
    "img/2.jpg",
    "img/3.jpg",
    "img/4.jpg",
    "img/5.jpg",
    "img/6.jpg"
  ]);

  // Set the scene background property to the resulting texture.
  scene.background = texture;
  return null;
}

// Geometry
function Sphere() {
  const { scene, gl } = useThree();
  // The cubeRenderTarget is used to generate a texture for the reflective sphere.
  // It must be updated on each frame in order to track camera movement and other changes.
  const cubeRenderTarget = new WebGLCubeRenderTarget(256, {
    format: RGBAFormat,
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter
  });
  const cubeCamera = new CubeCamera(1, 1000, cubeRenderTarget);
  cubeCamera.position.set(0, 0, 0);
  scene.add(cubeCamera);

  // Update the cubeCamera with current renderer and scene.
  useFrame(() => cubeCamera.update(gl, scene));

  return (
    <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow>
      <directionalLight intensity={50} />
      <sphereGeometry attach="geometry" args={[2, 32, 32]} />
      <meshPhysicalMaterial
        attach="material"
        envMap={cubeCamera.renderTarget.texture}
        roughness={0}
        metalness={1}
      />
    </mesh>
  );
}

// Lights
function Space() {
  return (
    <Canvas className="canvas" style={{ height: '100%' }}>
      <CameraControls />
      <Sphere />
      <SkyBox />
    </Canvas>
  );
}

export default Space;
