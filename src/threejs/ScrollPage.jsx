import lerp from "lerp"
import React, { Suspense, useRef, useEffect } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { TextureLoader, LinearFilter } from "three"
import { Block, useBlock } from "./blocks"
import state from "./store"
import "./ScrollPage.css"

function Plane({ color = "white", map, ...props }) {
  return (
    <mesh {...props}>
      <planeBufferGeometry attach="geometry" />
      <meshBasicMaterial attach="material" color={color} map={map} />
    </mesh>
  )
}

function Cross() {
  const ref = useRef()
  const { viewportHeight } = useBlock()
  useFrame(() => {
    const curTop = state.top.current
    const curY = ref.current.rotation.z
    const nextY = (curTop / ((state.pages - 1) * viewportHeight)) * Math.PI
    ref.current.rotation.z = lerp(curY, nextY, 0.1)
  })
  return (
    <group ref={ref} scale={[2, 2, 2]}>
      <Plane scale={[1, 0.2, 0.2]} color="#e2bfca" />
      <Plane scale={[0.2, 1, 0.2]} color="#e2bfca" />
    </group>
  )
}

function Content({ left, children, map }) {
  const { contentMaxWidth, canvasWidth, margin } = useBlock()
  const aspect = 1.75
  const alignRight = (canvasWidth - contentMaxWidth - margin) / 2
  return (
    <group position={[alignRight * (left ? -1 : 1), 0, 0]}>
      <Plane scale={[contentMaxWidth, contentMaxWidth / aspect, 1]} color="#bfe2ca" map={map} />
      {children}
    </group>
  )
}

function Stripe() {
  const { contentMaxWidth } = useBlock()
  return <Plane scale={[100, contentMaxWidth, 1]} rotation={[0, 0, Math.PI / 4]} position={[0, 0, -1]} color="#e3f6f5" />
}

function Pages() {
  const textures = useLoader(TextureLoader, state.images)
  const [img1, img2, img3] = textures.map(texture => ((texture.minFilter = LinearFilter), texture))
  const { contentMaxWidth, mobile } = useBlock()
  const aspect = 1.75
  const pixelWidth = contentMaxWidth * state.zoom
  return (
    <>
      {/* First section */}
      <Block factor={1.5} offset={0}>
        <Content left map={img1}>
          <Html style={{ width: pixelWidth / (mobile ? 1 : 2), textAlign: "left" }} position={[-contentMaxWidth / 2, -contentMaxWidth / 2 / aspect - 0.4, 1]}>
            The substance can take you to heaven but it can also take you to hell.
          </Html>
        </Content>
      </Block>
      {/* Second section */}
      <Block factor={2.0} offset={1}>
        <Content map={img2}>
          <Html style={{ width: pixelWidth / (mobile ? 1 : 2), textAlign: "right" }} position={[mobile ? -contentMaxWidth / 2 : 0, -contentMaxWidth / 2 / aspect - 0.4, 1]}>
            We’ve found that the people whose EEG doesn’t show any alpha-wave activity when they’re relaxed aren’t likely to respond significantly to the substance.
          </Html>
        </Content>
      </Block>
      {/* Stripe */}
      <Block factor={-1.0} offset={1}>
        <Stripe />
      </Block>
      {/* Last section */}
      <Block factor={1.5} offset={2}>
        <Content left map={img3}>
          <Block factor={-0.5}>
            <Cross />
          </Block>
          <Html style={{ width: pixelWidth / (mobile ? 1 : 2), textAlign: "left" }} position={[-contentMaxWidth / 2, -contentMaxWidth / 2 / aspect - 0.4, 1]}>
            <div>Education and enlightenment.</div>
          </Html>
        </Content>
      </Block>
    </>
  )
}

function Startup() {
  const ref = useRef()
  useFrame(() => (ref.current.material.opacity = lerp(ref.current.material.opacity, 0, 0.025)))
  return (
    <mesh ref={ref} position={[0, 0, 200]} scale={[100, 100, 1]}>
      <planeBufferGeometry attach="geometry" />
      <meshBasicMaterial attach="material" color="#dfdfdf" transparent />
    </mesh>
  )
}

export default function ScrollPage() {
  const scrollArea = useRef()
  const onScroll = e => (state.top.current = e.target.scrollTop)
  useEffect(() => void onScroll({ target: scrollArea.current }), [])
  return (
    <>
      <Canvas className="canvas" orthographic camera={{ zoom: state.zoom, position: [0, 0, 500] }}>
        <Suspense fallback={null}>
          <Pages />
          <Startup />
        </Suspense>
      </Canvas>
      <div className="scrollArea" ref={scrollArea} onScroll={onScroll}>
        <div style={{ height: `${state.pages * 100}vh` }} />
      </div>
    </>
  )
}
