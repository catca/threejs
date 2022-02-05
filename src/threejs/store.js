import { createRef } from "react"

const state = {
  sections: 3,
  pages: 3,
  zoom: 1,
  images: ["img/1.jpg", "img/2.jpg", "img/3.jpg"],
  top: createRef()
}

export default state
