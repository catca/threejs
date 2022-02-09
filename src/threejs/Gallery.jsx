import * as THREE from 'three'
import { useEffect, useRef, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCursor, MeshReflectorMaterial, Image, Text, Environment, PerspectiveCamera, Html, Reflector } from '@react-three/drei'
import { useRoute, useLocation, Link } from 'wouter'
import randomColor from 'randomcolor'
import getUuid from 'uuid-by-string'

const GOLDENRATIO = 1.61803398875
const randomPos = (min = 4, max = -4) => Math.random() * (max - min) + min

const images = [
  // Front
  { position: [0, 0, 2], rotation: [0, 0, 0], url: '/img/gallery/portfolio.PNG', intro: 'portfolio', href: 'http://localhost:3000' },
  // Left
  { position: [-2.2, 0, 2.2], rotation: [0, Math.PI / 7, 0], url: '/img/gallery/shiningstargram.PNG', intro: 'shiningstargram', href: 'https://shiningstargram.vercel.app' },
  // Right
  { position: [2.2, 0, 2.2], rotation: [0, -Math.PI / 7, 0], url: '/img/gallery/bunnymarket.PNG', intro: 'bunnymarket', href: 'http://bunnymarket.o-r.kr:3000' },
]

export default function Gallery() {
  const [zoom, setZoom] = useState(false)
  const [focus, setFocus] = useState({})
  const momentsArray = useMemo(() => Array.from({ length: 200 }, () => ({ color: randomColor(), position: [randomPos(), randomPos(), randomPos() + 2], speed: Math.random() * 0.5 + 0.25 })), [])
  return (
    <Suspense fallback={null}>
      <Canvas shadows>
      {/* <directionalLight color={'#FF0000'} position={[0, 10, 0]} intentsity={1} castShadow/> */}
      <directionalLight color={'#5CFFD1'} position={[0, 10, 0]} intentsity={1} castShadow/>
      <color attach="background" args={['#191920']} />
      {/* <fog attach="fog" args={['#FF0000', 0, 30]} /> */}
      {/* <Environment preset="city" /> */}
      <pointLight intensity={1} position={[0, 10, 0]} castShadow decay={0}/>
      <ambientLight intentsity={10}/>
      <spotLight position={[0, 15, 2]} angle={0.4} penumbra={1} intensity={1} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
      {/* <perspectiveCamera /> */}
      <group position={[0, -0.5, 0]}>
        <Frames images={images} />
      </group>
      <Planet />
      <Cloud momentsData={momentsArray}/>
      </Canvas>
    </Suspense>
  )
}

function Frames({ images, q = new THREE.Quaternion(), p = new THREE.Vector3() }) {
  const ref = useRef()
  const clicked = useRef()
  const [, params] = useRoute('/item/:id')
  const [, setLocation] = useLocation()

  useEffect(() => {
    clicked.current = ref.current.getObjectByName(params?.id)
    if (clicked.current) {
      clicked.current.parent.updateWorldMatrix(true, true)
      clicked.current.parent.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25))
      clicked.current.parent.getWorldQuaternion(q)
    } else {
      p.set(0, 0, 5.5)
      q.identity()
    }
  })
  useFrame((state, dt) => {
    // damp 함수 안의 변수 변경 0, 1, 3 => 0, 1, 2
    state.camera.position.lerp(p, THREE.MathUtils.damp(0, 1, 4, 0.016))
    // 0, 1, 3 => 1(중요), 1, 10
    state.camera.quaternion.slerp(q, THREE.MathUtils.damp(1, 1, 10, 0.016))
  })
  const handleClick = (e) => {
    e.stopPropagation();
    setLocation(clicked.current === e.object ? '/' : '/item/' + e.object.name)
  }
  return (
    <group
      ref={ref}
      onClick={(e) => handleClick(e)}
      onPointerMissed={() => setLocation('/')}>
      {images.map((props) => <Frame key={props.url} intro={props.intro} href={props.href} {...props} /> /* prettier-ignore */)}
    </group>
  )
}

function Frame({ url, c = new THREE.Color(), intro, href, ...props }) {
  const [hovered, hover] = useState(false)
  const [rnd] = useState(() => Math.random())
  const image = useRef()
  const frame = useRef()
  const name = getUuid(url)
  useCursor(hovered)
  useFrame((state) => {
    image.current.material.zoom = hovered ? 0.5 : 0.75 + Math.sin(rnd * 10000 + state.clock.elapsedTime / 3) / 4
    image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, 0.85 * (hovered ? 0.85 : 1), 0.1)
    image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, 0.9 * (hovered ? 0.905 : 1), 0.1)
    frame.current.material.color.lerp(c.set(hovered ? '#C0C0C0' : 'white').convertSRGBToLinear(), 0.1)
  })
  return (
    <group {...props}>
      <mesh
        name={name}
        onPointerOver={(e) => { e.stopPropagation(); hover(true) }}
        onPointerOut={() => hover(false)}
        scale={[GOLDENRATIO, 1, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} envMapIntensity={2} />
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]} castShadow>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        <Image alt={url} raycast={() => null} ref={image} position={[0, 0, 0.7]} url={url}/>
      </mesh>
      <Text maxWidth={0.1} anchorX="left" anchorY="top" position={[0.25, 1.5, 0]} fontSize={0.1} onClick={() => document.location.href = href}>
        {intro}
      </Text>
    </group>
  )
}

function Planet() {
  const planetRef = useRef();
  const [radius, setRadius] = useState(0);
  useEffect(() => {
    const x = planetRef.current.position.x;
    const z = planetRef.current.position.z;
    setRadius(Math.sqrt(x * x + (z - 2) * (z - 2)));
  }, [])
  useFrame((state) => {
    if (radius) {
      const time = state.clock.elapsedTime;
      const speed = 1.4;
      planetRef.current.position.x = Math.cos(time * speed) * radius;
      planetRef.current.position.y = -Math.cos(time * speed) * radius;
      planetRef.current.position.z = Math.sin(time * speed) * radius + 2;
      planetRef.current.rotation.x += 0.03 * Math.sin(time * Math.random()) + 0.03;
      planetRef.current.rotation.y += 0.03 * Math.sin(time * Math.random()) + 0.03;
      planetRef.current.rotation.z += 0.03 * Math.sin(time * Math.random()) + 0.03;
    }
  })
  return (
    <mesh ref={planetRef} position={[23, -1.3, 2]} receiveShadow>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshPhysicalMaterial
        roughness={1}
        metalness={1}
        color="#0000FF"
      />
      <spotLight position={[0, 0, 1]} intensity={1}/>
    </mesh>
  )
}

function Cloud({ momentsData}) {
  return momentsData.map(({ position, speed }, i) => (
    <Tetrahedron key={i} position={position} speed={speed} index={i}/>
  ))
}

function Tetrahedron({ position, index, speed }) {
  const tetrahedronRef = useRef();
  const [radius, setRadius] = useState(0);
  useEffect(() => {
    const x = tetrahedronRef.current.position.x;
    const z = tetrahedronRef.current.position.z;
    setRadius(Math.sqrt(x * x + (z - 2) * (z - 2)));
  }, [])
  useFrame((state) => {
    if (radius) {
      const time = state.clock.elapsedTime;
      tetrahedronRef.current.position.x = Math.cos(time * speed) * radius;
      tetrahedronRef.current.position.z = Math.sin(time * speed) * radius + 2;
      tetrahedronRef.current.rotation.x += 0.03 * Math.sin(time * Math.random()) + 0.03;
      tetrahedronRef.current.rotation.y += 0.03 * Math.sin(time * Math.random()) + 0.03;
      tetrahedronRef.current.rotation.z += 0.03 * Math.sin(time * Math.random()) + 0.03;
    }
  })
  return (
    <mesh castShadow key={index} ref={tetrahedronRef} position={position} rotation={position}>
      <tetrahedronGeometry
        attach="geometry"
        args={[0.02, 0]}
        applyMatrix={new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(2, 0, -1).normalize(),
          Math.atan(Math.sqrt(2))
        )}
        castShadow
      />
      <meshStandardMaterial color={'#FFFFFF'} metalness={1} castShadow/>
    </mesh>
  )
}
