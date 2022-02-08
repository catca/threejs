import * as THREE from "three";
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import "./styles.css";

const Sphere = () => {
  const sphereRef = useRef();
  const repeatX = 3;
  const repeatY = 2;

  const [base, bump, normal, ao, rough] = useLoader(
    // THREE.TextureLoader,
    // [
    //   "img/metal/metal1_basecolor.jpg",
    //   "img/metal/metal1_height.png",
    //   "img/metal/metal1_normal.jpg",
    //   "img/metal/metal1_ambientOcclusion.jpg",
    //   "img/metal/metal1_metallic.jpg",
    //   "img/metal/metal1_roughness.jpg"
    // ]
    // THREE.TextureLoader,
    // [
    //   "img/stained/Glass_Stained_001_basecolor.jpg",
    //   "img/stained/Glass_Stained_001_height.png",
    //   "img/stained/Glass_Stained_001_normal.jpg",
    //   "img/stained/Glass_Stained_001_ambientOcclusion.jpg",
    //   "img/stained/Glass_Stained_001_metallic.jpg",
    //   "img/stained/Glass_Stained_001_roughness.jpg",
    //   "img/stained/Glass_Stained_001_Glass.jpg",
    // ]
    THREE.TextureLoader,
    [
      "img/watermelon/Watermelon_001_basecolor.jpg",
      "img/watermelon/Watermelon_001_height.png",
      "img/watermelon/Watermelon_001_normal.jpg",
      "img/watermelon/Watermelon_001_ambientOcclusion.jpg",
      "img/watermelon/Watermelon_001_roughness.jpg",
    ]
  );

  [base, bump, normal, ao, rough].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
  });

  useFrame(() => {
    sphereRef.current.rotation.x += 0.01;
    sphereRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[3, 36, 36]} />
      <meshPhysicalMaterial
        map={base}
        bumpMap={bump}
        aoMap={ao}
        normalMap={normal}
        roughnessMap={rough}
        glass={1}
      />
    </mesh>
  );
};

const stars = new Array(1000);

const TextureSphere = () => {
  return (
    <Canvas>
      <pointLight position={[10, 0, -10]} intensity={3} />
      <pointLight position={[-3, 0, 10]} intensity={3} />
      <pointLight position={[2, -10, 0]} intensity={3} />
      <ambientLight />
      <Suspense fallback={null}>
        {stars.map((props, index) => {
          return (
            <mesh key={index} position={[Math.random() * 10, Math.random() * 10, Math.random() * 10]}>
              <tetrahedronGeometry args={[2, 0]}/>
              <meshPhongMaterial color={'#000000'}/>
            </mesh>
          )
        })}
      </Suspense>
      <OrbitControls />
      <Stats />
    </Canvas>
  );
};

export default TextureSphere;