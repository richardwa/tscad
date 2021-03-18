import { initialState, setupWebGL } from './gl-util';
import { registerClickAndDrag, registerScrollWheel } from './mouse-orbit';

const canvas = document.createElement("canvas");
canvas.width = initialState.iResolution[0];
canvas.height = initialState.iResolution[1];
document.body.append(canvas);
const setGLState = setupWebGL(canvas);
let state = { ...initialState };

registerClickAndDrag(canvas, ({ current, startPos, end }) => {
  const pos = state.cameraPos;
  const tmp = {
    ...state,
    cameraPos: [
      pos[0] - Math.abs(pos[2]) * (current[0] - startPos[0]) / initialState.iResolution[0],
      pos[1] + Math.abs(pos[2]) * (current[1] - startPos[1]) / initialState.iResolution[1],
      pos[2]
    ]
  };
  window.requestAnimationFrame(() => {
    setGLState(tmp);
  });
  if (end) {
    state = tmp;
  }
});

registerScrollWheel(canvas, (zoom) => {
  const [x, y, z] = state.cameraPos;
  const tmp = { ...state, cameraPos: [x, y, z + Math.sign(zoom)] }
  window.requestAnimationFrame(() => {
    setGLState(tmp);
  });
  state = tmp;
});