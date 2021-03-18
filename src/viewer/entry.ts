import { initialState, setupWebGL, State } from './gl-util';
import { registerClickAndDrag, registerScrollWheel } from './mouse-orbit';
declare global {
  interface Window { setGLState: (s: State) => void }
}
const canvas = document.createElement("canvas");
canvas.width = initialState.iResolution[0];
canvas.height = initialState.iResolution[1];
document.body.append(canvas);
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }
window.setGLState = setupWebGL(canvas);
let state = { ...initialState };

registerClickAndDrag(canvas, ({ current, startPos, end, leftClick }) => {
  const tmp = { ...state };
  if (leftClick) {
    const pos = state.cameraPos;
    tmp.cameraPos = [
      pos[0] - Math.abs(pos[2]) * (current[0] - startPos[0]) / initialState.iResolution[0],
      pos[1] + Math.abs(pos[2]) * (current[1] - startPos[1]) / initialState.iResolution[1],
      pos[2]
    ];
  } else {
    const dir = state.cameraDir;
    tmp.cameraDir = [
      dir[0] - Math.abs(dir[2]) * (current[0] - startPos[0]) / initialState.iResolution[0],
      dir[1] + Math.abs(dir[2]) * (current[1] - startPos[1]) / initialState.iResolution[1],
      dir[2]
    ];
  }
  window.requestAnimationFrame(() => {
    window.setGLState(tmp);
  });
  if (end) {
    state = tmp;
  }
});

registerScrollWheel(canvas, (zoom) => {
  const [x, y, z] = state.cameraPos;
  const tmp = { ...state, cameraPos: [x, y, z + Math.sign(zoom)] }
  window.requestAnimationFrame(() => {
    window.setGLState(tmp);
  });
  state = tmp;
});