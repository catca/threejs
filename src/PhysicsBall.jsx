import * as THREE from "three"
import { useRef, useState, useEffect, useCallback } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Physics, useSphere, useBox, usePlane } from "@react-three/cannon";
import { useSpring } from "@react-spring/core"
import { a } from "@react-spring/web"
import "./styles.css";

function Ball({ x, setCount }) {
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
  const [ref, api] = useSphere(() => ({ mass: 1, args: [0.5], position: [0, 5, 0] }))
  // usePlane((state) => ({
  //   type: "Static",
  //   rotation: [-Math.PI / 2, 0, 0],
  //   position: [0, -10, 0],
  //   onCollide: () => {
  //     api.position.set(0, 5, 0)
  //     api.velocity.set(0, 5, 0)
  //     state.api.reset()
  //   },
  // }))
	const [hovered, setHover] = useState(false)
  useEffect(() => void (document.body.style.cursor = hovered ? "pointer" : "auto"), [hovered])
  const onClick = useCallback(() => {
    setCount((toggle) => toggle + 1);
  }, [setCount])
  const onPointerOver = useCallback(() => setHover(true), [])
  const onPointerOut = useCallback(() => setHover(false), [])
	const rZ = x.to([0, 1], [0, -Math.PI * 5]);
  const rX = x.to([0, 1], [0, Math.PI * 5]);
  return (
    <a.mesh castShadow ref={ref} rotation-y={rX} rotation-x={rZ} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <a.sphereGeometry args={[0.5, 64, 64]} />
      <meshPhysicalMaterial
				map={base}
				bumpMap={bump}
				aoMap={ao}
				normalMap={normal}
				metalnessMap={metal}
				roughnessMap={rough}
				glassMap={glass}
			/>
    </a.mesh>
  )
}

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
			<meshPhongMaterial color="#374037" />
    </mesh>
  )
}

export default function PhysicsBall() {
	const [count, setCount] = useState(0);
	const [{ x }] = useSpring({ x: count, config: { mass: 20, tension: 400, friction: 600, precision: 0.0001 } }, [count])
  return (
    <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
			<OrbitControls />
      <color attach="background" args={["#171720"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[-10, -10, -10]} />
      <spotLight position={[10, 10, 10]} angle={0.4} penumbra={1} intensity={1} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
      <Physics
        iterations={20}
        tolerance={0.0001}
        gravity={[0, -20, 0]}
        defaultContactMaterial={{
          friction: 0.9,
          restitution: 0.7,
          contactEquationStiffness: 1e7,
          contactEquationRelaxation: 1,
          frictionEquationStiffness: 1e7,
          frictionEquationRelaxation: 2,
        }}>
        <mesh position={[0, 0, -10]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshPhongMaterial color="#374037" />
        </mesh>
				{/* <mesh receiveShadow>
          <planeGeometry  rotation={[-Math.PI / 2, 0, -Math.PI / 2]} position={[0, 0, 0]} scale={[200, 40, 1]} />
          <meshPhongMaterial color="#374037" />
        </mesh> */}
        {<Ball x={x} setCount={setCount}/>}
				<Plane />
      </Physics>
    </Canvas>
  )
}
