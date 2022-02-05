import React, { useState, useEffect, useCallback, Suspense, useMemo, useRef } from "react"
import * as THREE from "three";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, Shadow, meshBounds, PerspectiveCamera, OrbitControls, CameraShake } from "@react-three/drei"
import CameraControls from 'camera-controls'
import { a } from "@react-spring/three"

CameraControls.install({ THREE })

function Switch({ x, set, ref }) {
  // const { nodes, materials } = useGLTF("switch.glb")
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

  return (
    <group scale={[1.25, 1.25, 1.25]} dispose={null}>
      <a.mesh receiveShadow castShadow material-color={"#888"} material-roughness={0.5} material-metalness={0.8} />
      <a.group position-y={0.85} position-x={pZ}>
        <a.mesh receiveShadow castShadow raycast={meshBounds} rotation-z={rX} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
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
        <a.pointLight intensity={100} distance={1.4} color={"#888"} />
        <Shadow renderOrder={-1000} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.5} />
      </a.group>
    </group>
  )
}

function Controls({ focus, pos = new THREE.Vector3(), look = new THREE.Vector3() }) {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const controls = useMemo(() => new CameraControls(camera, gl.domElement), [])
  return useFrame((state, delta) => {
    pos.set(focus.x, focus.y, focus.z + 0.2)
    look.set(focus.x, focus.y, focus.z - 0.2)

    state.camera.position.lerp(pos, 0.5)
    state.camera.updateProjectionMatrix()

    controls.setLookAt(state.camera.position.x, state.camera.position.y, state.camera.position.z, look.x, look.y, look.z, true)
    return controls.update(delta)
  })
}

function AutoCamera({ x }) {
  const pZ = x.to([0, 1], [0, 5])
  console.log(pZ);
  useFrame((state) => {
    // state.camera.position.z = pZ;
    state.camera.updateProjectionMatrix()
  })
  return null
}

function Rig() {
  const [vec] = useState(() => new THREE.Vector3())
  const { camera, mouse } = useThree()
  useFrame(() => camera.position.lerp(vec.set(mouse.x * 2, 1, 60), 0.05))
  return <CameraShake maxYaw={0.01} maxPitch={0.01} maxRoll={0.01} yawFrequency={0.5} pitchFrequency={0.5} rollFrequency={0.4} />
}

export function Scene({ x, set }) {

  return (
    <Canvas orthographic shadows dpr={[1, 2]} camera={{ zoom: 60, position: [0, 1, 30], fov: 35 }}>
      <OrbitControls makeDefault />
      <ambientLight intensity={0.1} />
      <directionalLight position={[-20, 20, 20]} intensity={1} />
      <a.directionalLight position={[-20, -20, -20]} intensity={0.5} color={"#7fffd4"} />
      <a.pointLight position={[0, 0, 5]} distance={5} intensity={5} color={"#7fffd4"} />
      <a.spotLight color={"#7fffd4"} position={[10, 20, 20]} angle={0.1} intensity={2} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.00001} castShadow />
      <Suspense fallback={null}>
        <Switch x={x} set={set} />
        <Rig />
      </Suspense>
      <mesh receiveShadow renderOrder={1000} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} color={"#FF0000"} />
        <a.shadowMaterial transparent opacity={x.to((x) => 0.1 + x * 0.2)} />
      </mesh>
    </Canvas>
  )
}
