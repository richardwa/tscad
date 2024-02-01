import { initialState, setupWebGL, type ShaderSrc } from './gl-mesher'
import { main } from '../../projects/sample'
import { getShaderSrc } from '../csg/glsl-util'
import { LineSimplify, type Segment } from '../util/line-simplify'
import { V2 } from '../util/math'
import { outgoingDirection } from '../slice/march-vector-table'
declare global {
  interface Window {
    shaderSrc?: ShaderSrc
  }
}
const canvas = document.createElement('canvas')
canvas.width = initialState.iResolution[0]
canvas.height = initialState.iResolution[1]
document.body.append(canvas)
canvas.oncontextmenu = function (e) {
  e.preventDefault()
  e.stopPropagation()
}

if (window.shaderSrc) {
  const socket = new WebSocket('ws://' + window.location.host)
  socket.onopen = function (e) {
    socket.send('connection established')
  }
  socket.onmessage = (event) => {
    console.log(`from server: ${event.data}`)
    if (event.data === 'reload') {
      socket.close(1000)
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }
}

const shaderSrc: ShaderSrc = window.shaderSrc || getShaderSrc(main.gl)
const setState = setupWebGL(canvas, shaderSrc)
if (setState) {
  console.log('initial state', JSON.stringify(initialState))

  const steps = initialState.iResolution[2]
  const width = initialState.iResolution[0]
  const simplify = new LineSimplify((v: Vec2) => v[0] + v[1] * width)

  // @ts-ignore
  window.simplify = simplify
  const output: Segment<Vec2>[][] = []
  // @ts-ignore
  window.output = output
  console.time('render')
  let done = 0
  for (let j = 0; j < steps; j++) {
    const state = { ...initialState, step: j }
    const pixels = setState(state)
    simplify.clear()
    const arr32 = new Uint32Array(pixels.buffer)
    for (let i = 0; i < arr32.length; i++) {
      if (arr32[i] > 0) {
        const pixelIndex = i * 4
        const x = i % width
        const y = Math.floor(i / width)
        const hash = pixels[pixelIndex + 2]
        const [a, b] = outgoingDirection[hash]

        simplify.addSegment({
          length: 1,
          node: [x, y],
          next: [x + a, y + b],
          normal: V2.normalize([pixels[pixelIndex] - 128, pixels[pixelIndex + 1] - 128])
        })
      }
    }
    const reduced = simplify.getReducedSegments()
    //console.log("segments", j, simplify.segments.size,'>',reduced.length);
    if (reduced.length > 0) {
      output.push(reduced)
    }

    done++
    if (done === steps) {
      console.timeEnd('render')
    }
  }
}
