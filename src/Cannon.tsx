import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics, usePlane, useBox, PlaneProps, BoxProps, useSphere, SphereProps } from '@react-three/cannon'
import "./styles.css";

function Plane(props: PlaneProps) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh ref={ref}>
      <planeGeometry args={[100, 100]} />
    </mesh>
  )
}

function Cube(props: SphereProps) {
  const [ref] = useSphere(() => ({ mass: 1, position: [0, 10, 0], rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh ref={ref}>
      <sphereGeometry />
    </mesh>
  )
}

export default function Cannon(){
  return (
    <Canvas>
      <Physics>
          <Plane />
          <Cube />
      </Physics>
  </Canvas>
  )
}