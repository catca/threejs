import React, { useState } from "react"
import { useSpring } from "@react-spring/core"
import { a } from "@react-spring/web"
import { Scene } from "./Toggle"
import "./ToggleApp.css"

function ToggleApp() {
  const [toggle, set] = useState(0)
  // Set up a shared spring which simply animates the toggle above
  // We use this spring to interpolate all the colors, position and rotations
  const [{ x }] = useSpring({ x: toggle, config: { mass: 50, tension: 1000, friction: 100, precision: 0.0001 } }, [toggle])
  return (
    <a.div className="container" style={{ backgroundColor: "#c9ffed" }}>
      <h1 className="open" children="<h1>" />
      <h1 className="close" children="</h1>" />
      <a.h1>{x.to((x) => (x + 8).toFixed(2))}</a.h1>
      <Scene x={x} set={set} />
    </a.div>
  )
}

export default ToggleApp;
