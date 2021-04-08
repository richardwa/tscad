
import { initialState, setupWebGL, ShaderSrc, State } from './gl-util';
import { registerClickAndDrag, registerScrollWheel, SphericalSystem, sphericalToCartesion } from './mouse-orbit';
import { main } from './sample';
import { getShaderSrc } from '../csg/glsl-util';
import { V3 } from '../util/math';
declare global {
  interface Window { shaderSrc?: ShaderSrc; }
}
const canvas = document.createElement("canvas");
canvas.width = initialState.iResolution[0];
canvas.height = initialState.iResolution[1];
document.body.append(canvas);
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }

if (window.shaderSrc) {
  const socket = new WebSocket("ws://" + window.location.host);
  socket.onopen = function (e) {
    socket.send("connection established");
  };
  socket.onmessage = (event) => {
    console.log(`from server: ${event.data}`);
    if (event.data === "reload") {
      socket.close(1000);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };
}

const shaderSrc: ShaderSrc = window.shaderSrc || getShaderSrc(main.gl);
const setState = setupWebGL(canvas, shaderSrc);

let orbitalState: SphericalSystem = {
  pos: [300, Math.PI / 4, Math.PI / 4],
  origin: [0, 0, 0]
};
console.log('initial state', JSON.stringify(initialState));
let state: State = { ...initialState, ...sphericalToCartesion(orbitalState) }
console.log('new     state', JSON.stringify(state));
setState(state);


registerClickAndDrag(canvas, ({ current, startPos, end, leftClick }) => {
  const screenX = (current[0] - startPos[0]) / initialState.iResolution[0];
  const screenY = (current[1] - startPos[1]) / initialState.iResolution[1];
  const tmp: SphericalSystem = { ...orbitalState };
  if (leftClick) {
    // rotate
    const pos = orbitalState.pos;
    tmp.pos = [
      pos[0],
      pos[1] - screenY * 5,
      pos[2] - screenX * 5
    ];
  } else {
    // pan
    const origin = orbitalState.origin;
    const deltaY = V3.scale(screenY, state.cameraTop);
    const deltaX = V3.scale(screenX, V3.cross(state.cameraTop, state.cameraDir));
    const delta = V3.scale(orbitalState.pos[0] / 10, V3.add(deltaX, deltaY));
    tmp.origin = V3.add(origin, delta);
  }
  const _state = { ...state, ...sphericalToCartesion(tmp) };
  if (end) {
    orbitalState = tmp;
    state = _state;
  }
  window.requestAnimationFrame(() => {
    setState(_state);
  });
});

registerScrollWheel(canvas, (zoom) => {
  const tmp = { ...orbitalState };
  tmp.pos[0] += Math.sign(zoom) * Math.max(tmp.pos[0] / 10, 1);
  orbitalState = tmp;
  state = { ...state, ...sphericalToCartesion(tmp) };
  window.requestAnimationFrame(() => {
    setState(state);
  });
});