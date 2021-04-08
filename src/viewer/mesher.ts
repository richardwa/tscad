import { initialState, setupWebGL, ShaderSrc, State } from './gl-mesher';
import { main } from './sample';
import { getShaderSrc } from '../csg/glsl-util';
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
console.log('initial state', JSON.stringify(initialState));

const steps = initialState.iResolution[2];
for (let i = 0; i < steps; i++) {
  const pixels = setState({ ...initialState, step: i });
  console.log(pixels);
}


