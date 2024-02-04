<script setup lang="ts">
import { initialState, setupWebGL, type ShaderSrc, type State } from '../util/gl-util'
import {
  registerClickAndDrag,
  registerScrollWheel,
  type SphericalSystem,
  sphericalToCartesion
} from '../util/mouse-orbit'
import { V3 } from '../util/math'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getShaderSrc } from '../csg/glsl-util'
import { downloadBinaryFile, replaceFileExtension } from '../util/browser-files'
import { dualMarch } from '../dual3/dual-march'
import { processPolygons } from '../util/process-mesh'

const route = useRoute()
const file = route.params.file as string
const newFile = replaceFileExtension(file, 'obj')
const canvasRef = ref(null)
let mainShape: any = null
onMounted(async () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const { main } = await import(/* @vite-ignore */ `../../projects/${file}`)
  mainShape = main
  const shaderSrc: ShaderSrc = getShaderSrc(main.gl)

  const setState = setupWebGL(canvas, shaderSrc)
  if (!setState) return

  let orbitalState: SphericalSystem = {
    pos: [300, Math.PI / 4, Math.PI / 4],
    origin: [0, 0, 0]
  }
  console.log('initial state', JSON.stringify(initialState))
  let state: State = { ...initialState, ...sphericalToCartesion(orbitalState) }
  console.log('new     state', JSON.stringify(state))
  setState(state)

  registerClickAndDrag(canvas, ({ current, startPos, end, leftClick }) => {
    const screenX = (current[0] - startPos[0]) / initialState.iResolution[0]
    const screenY = (current[1] - startPos[1]) / initialState.iResolution[1]
    const tmp: SphericalSystem = { ...orbitalState }
    if (leftClick) {
      // rotate
      const pos = orbitalState.pos
      tmp.pos = [pos[0], pos[1] - screenY * 5, pos[2] - screenX * 5]
    } else {
      // pan
      const origin = orbitalState.origin
      const deltaY = V3.scale(screenY, state.cameraTop)
      const deltaX = V3.scale(screenX, V3.cross(state.cameraTop, state.cameraDir))
      const delta = V3.scale(orbitalState.pos[0] / 10, V3.add(deltaX, deltaY))
      tmp.origin = V3.add(origin, delta)
    }
    const _state = { ...state, ...sphericalToCartesion(tmp) }
    if (end) {
      orbitalState = tmp
      state = _state
    }
    window.requestAnimationFrame(() => {
      setState(_state)
    })
  })

  registerScrollWheel(canvas, (zoom) => {
    const tmp = { ...orbitalState }
    tmp.pos[0] += Math.sign(zoom) * Math.max(tmp.pos[0] / 10, 1)
    orbitalState = tmp
    state = { ...state, ...sphericalToCartesion(tmp) }
    window.requestAnimationFrame(() => {
      setState(state)
    })
  })
})

const render = () => {
  if (!mainShape) {
    alert('no shape loaded')
    return
  }

  console.time('render')
  const faces = dualMarch({
    size: 2,
    minSize: 1,
    shape: mainShape
  })
  console.timeEnd('render')
  const mesh = processPolygons(faces)
  const sb: string[] = []
  //write obj file
  for (const pos of mesh.vertices) {
    sb.push('v ' + pos.join(' '))
  }
  for (const face of mesh.faces) {
    sb.push('f ' + face.map((i) => i + 1).join(' '))
  }

  downloadBinaryFile(new TextEncoder().encode(sb.join('\n')), newFile)
}
</script>

<template>
  <div class="grid">
    <button>reset view</button>
    <button @click="render">download {{ newFile }}</button>
  </div>
  <canvas
    ref="canvasRef"
    :width="initialState.iResolution[0]"
    :height="initialState.iResolution[1]"
  />
</template>
