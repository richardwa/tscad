import { Vector } from '../util/math';
import { initialState, setupWebGL, State } from './gl-util';
import { registerClickAndDrag, registerScrollWheel, SphericalSystem, sphericalToCartesion } from './mouse-orbit';

const canvas = document.createElement("canvas");
canvas.width = initialState.iResolution[0];
canvas.height = initialState.iResolution[1];
document.body.append(canvas);
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }
const setState = setupWebGL(canvas);
let orbitalState: SphericalSystem = {
  pos: [40, Math.PI / 4, Math.PI / 4],
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
      pos[1] - screenX * 5,
      pos[2] + screenY * 5
    ];
  } else {
    // pan
    const origin = orbitalState.origin;
    const deltaY = new Vector(state.cameraTop).scale(screenY).result;
    const deltaX = new Vector(state.cameraTop).cross(state.cameraDir).scale(screenX).result;
    const delta = new Vector(deltaX).add(deltaY).scale(15).result;
    tmp.origin = new Vector(origin).add(delta).result;
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
  tmp.pos[0] += Math.sign(zoom);
  orbitalState = tmp;
  state = { ...state, ...sphericalToCartesion(tmp) };
  window.requestAnimationFrame(() => {
    setState(state);
  });
});