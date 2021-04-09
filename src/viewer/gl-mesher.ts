import { V3 } from "../util/math";

export const fragmentShaderSrc = ({ entry, funcs }: ShaderSrc) => `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform vec3 lower;
uniform vec3 upper;
uniform float step;

out vec4 FragColor;

#define MAX_STEPS 100
#define MAX_DIST 1000.
#define SURF_DIST .01

${funcs.join('\n\n')}

float GetDist(vec3 p) {
  return ${entry}(p);
}

vec3 GetPoint(vec2 fragCoord){
  return lower + vec3(fragCoord,step)/iResolution * (upper - lower);
}

vec2 GetNormal(vec3 p) {
	float d = GetDist(p);
  vec2 n = d - vec2(
    GetDist(p-vec3(.01, 0, 0)),
    GetDist(p-vec3(0, .01, 0))
  );
  return normalize(n);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
  vec3 p = GetPoint(fragCoord);
  float d0 = GetDist(p);
  float d1 = GetDist(GetPoint(fragCoord+vec2(1,0)));
  float d2 = GetDist(GetPoint(fragCoord+vec2(0,1)));
  float d3 = GetDist(GetPoint(fragCoord+vec2(1,1)));

  float hash = max(sign(d0),0.) + max(sign(d1),0.)*2. + max(sign(d2),0.)*4. + max(sign(d3),0.)*8.;

  if (hash == 0. || hash == 15.) {
    fragColor = vec4(0.,0.,0.,0.0);
  }else{
    vec2 n = GetNormal(p);
    n = n/2. + 0.5;
    fragColor = vec4(n, hash/256., 1);
  }
  
}

void main() {
  mainImage(FragColor, gl_FragCoord.xy);
}
`;

export const vertexShaderSrc = `#version 300 es
  in vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);  
  } 
`;
export const initialState = {
  iResolution: [100, 100, 100] as Vec3,
  lower: [-20, -20, -20] as Vec3,
  upper: [20, 20, 20] as Vec3,
  step: 50
};

export type State = typeof initialState;
export type ShaderSrc = {
  entry: string,
  funcs: string[]
}
export const setupWebGL = (canvas: HTMLCanvasElement, src: ShaderSrc) => {

  const gl = canvas.getContext("webgl2");

  // @ts-ignore
  window.gl = gl;

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSrc);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  const fragmentSrc = fragmentShaderSrc(src);
  const fragmentSrcLines = fragmentSrc.split('\n').map((l, i) => `${i + 1}| ${l}`).join('\n');
  console.log(fragmentSrcLines);
  gl.shaderSource(fragmentShader, fragmentSrc);
  gl.compileShader(fragmentShader);
  console.log(gl.getShaderInfoLog(fragmentShader));

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  var vertices = new Float32Array([
    -1, -1, -1, 1, 1, 1,
    -1, -1, 1, -1, 1, 1,
  ]);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.useProgram(program);
  const glVars: any = {};
  Object.keys(initialState).forEach(key => {
    console.log('locating', key);
    glVars[key] = gl.getUniformLocation(program, key);
  });


  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const setState = (state: State) => {
    // set bindings
    Object.entries(state).forEach(([key, val]) => {
      if (val instanceof Array) {
        switch (val.length) {
          // case 1:
          //   gl.uniform1fv(glVars[key], val);
          //   break;
          // case 2:
          //   gl.uniform2fv(glVars[key], val);
          //   break;
          case 3:
            gl.uniform3fv(glVars[key], val);
            break;
          // case 4:
          //   gl.uniform4fv(glVars[key], val);
          //   break;
          default:
            throw 'unable to accomodate larger than 4 entries';
        }
      } else {
        gl.uniform1f(glVars[key], val);
      }
      //console.log('setting', key, val);
    });

    // draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const length = gl.drawingBufferWidth * gl.drawingBufferHeight;
    var pixels = new Uint8Array(length * 4);
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
  }
  setState(initialState);
  return setState;
}