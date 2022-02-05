import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { Shadow, meshBounds, RoundedBox, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import { a } from "@react-spring/three";
import CameraControls from 'camera-controls';

CameraControls.install({ THREE })

function damp(target, to, step, delta, v = new THREE.Vector3()) {
  if (target instanceof THREE.Vector3) {
    target.x = THREE.MathUtils.damp(target.x, to[0], step, delta)
    target.y = THREE.MathUtils.damp(target.y, to[1], step, delta)
    target.z = THREE.MathUtils.damp(target.z, to[2], step, delta)
  }
}

function Sphere({ x, set }) {
  const sphereRef = useRef();
  const [base, bump, normal, ao, metal, rough, glass] = useLoader(
    THREE.TextureLoader,
    [
      "img/stained/Glass_Stained_001_basecolor.jpg",
      "img/stained/Glass_Stained_001_height.png",
      "img/stained/Glass_Stained_001_normal.jpg",
      "img/stained/Glass_Stained_001_ambientOcclusion.jpg",
      "img/stained/Glass_Stained_001_metallic.jpg",
      "img/stained/Glass_Stained_001_roughness.jpg",
      "img/stained/Glass_Stained_001_Glass.jpg",
    ]
  );
  // Hover state
  const [hovered, setHover] = useState(false)
  useEffect(() => void (document.body.style.cursor = hovered ? "pointer" : "auto"), [hovered])
  // Events
  const onClick = useCallback(() => {
    set((toggle) => toggle + 1);
  }, [set])
  const onPointerOver = useCallback(() => setHover(true), [])
  const onPointerOut = useCallback(() => setHover(false), [])
  // Interpolations
  const pZ = x.to([0, 1], [0, 5])
  const rX = x.to([0, 1], [0, -Math.PI * 3])
  // const color = x.to([0, 1], ["#888", "#2a2a2a"])

  useFrame((state, delta) => {
    console.log(sphereRef.current.position.x);
    const step = 4;
    state.camera.fov = THREE.MathUtils.damp(state.camera.fov, 0, step, delta)
    damp(state.camera.position, [sphereRef.current.position.x, 1, 30], step, delta)
    state.camera.lookAt(sphereRef.current.position.x, 0, 0)
    state.camera.updateProjectionMatrix()
  });

  return (
    <group scale={[1.25, 1.25, 1.25]} dispose={null}>
      <a.mesh receiveShadow castShadow material-color={"#888"} material-roughness={0.5} material-metalness={0.8} />
      <a.group ref={sphereRef} position-y={0.85} position-x={pZ}>
        <a.mesh  receiveShadow castShadow raycast={meshBounds} rotation-z={rX} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <a.meshPhysicalMaterial
            map={base}
            bumpMap={bump}
            aoMap={ao}
            normalMap={normal}
            metalnessMap={metal}
            roughnessMap={rough}
            glassMap={glass}
          />
        </a.mesh>
        {/* <a.pointLight intensity={100} distance={1.4} color={"#888"} /> */}
        <Shadow renderOrder={-1000} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.5} />
      </a.group>
    </group>
  )
}

function Plane({ color, ...props }) {
  return (
    <RoundedBox receiveShadow castShadow smoothness={10} radius={0.015} {...props}>
      <meshStandardMaterial color={color} envMapIntensity={0.5} />
    </RoundedBox>
  )
}

export function Scene({ x, set }) {
  return (
    <Canvas orthographic shadows dpr={[1, 2]} camera={{ zoom: 60, position: [0, 1, 30], fov: 35 }}>
      <OrbitControls />
      <perspectiveCamera position={[0, 1, 30]} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[-20, 20, 20]} intensity={1} />
      <a.directionalLight position={[-20, -20, -20]} intensity={0.5} color={"#7fffd4"} />
      <a.pointLight position={[0, 0, 5]} distance={5} intensity={5} color={"#7fffd4"} />
      {/* <a.spotLight color={"#7fffd4"} position={[10, 20, 20]} angle={0.1} intensity={2} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.00001} castShadow /> */}
      <Suspense fallback={null}>
        <Physics gravity={[0, -50, 0]} defaultContactMaterial={{ restitution: 0.5 }}>
          <group position={[0, 0, -10]}>
            <Sphere x={x} set={set} />
            <Plane color="#FF0000" rotation={[-Math.PI / 2, 0, -Math.PI / 2]} position={[10, -0.4, 0]} scale={[4, 40, 1]} />
          </group>
        </Physics>
      </Suspense>
      <mesh receiveShadow renderOrder={1000} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} color={"#FF0000"} />
        <a.shadowMaterial transparent opacity={x.to((x) => 0.1 + x * 0.2)} />
      </mesh>
    </Canvas>
  )
}
