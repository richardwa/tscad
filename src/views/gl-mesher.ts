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

vec2 GetNormal(vec3 p, float d) {
  vec2 n = d - vec2(
    GetDist(p-vec3(.01, 0, 0)),
    GetDist(p-vec3(0, .01, 0))
  );
  return normalize(n);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
  vec3 p0 = GetPoint(fragCoord);
  vec3 p1 = GetPoint(fragCoord+vec2(1,0));
  vec3 p2 = GetPoint(fragCoord+vec2(0,1));
  vec3 p3 = GetPoint(fragCoord+vec2(1,1));
  float d0 = GetDist(p0);
  float d1 = GetDist(p1);
  float d2 = GetDist(p2);
  float d3 = GetDist(p3);

  float hash = max(sign(d0),0.) + max(sign(d1),0.)*2. + max(sign(d2),0.)*4. + max(sign(d3),0.)*8.;

  if (hash == 0. || hash == 15.) {
    fragColor = vec4(0.,0.,0.,0.0);
  }else{
    vec2 n;
    if (d0 > 0.) {
      n = GetNormal(p0, d0);
    }else if (d1 > 0.) {
      n = GetNormal(p1, d1);
    }else if (d2 > 0.) {
      n = GetNormal(p2, d2);
    }else {
      n = GetNormal(p3, d3);
    }
    
    n = n/2. + 0.5;
    fragColor = vec4(n, hash/256., 1);
  }
  
}

void main() {
  mainImage(FragColor, gl_FragCoord.xy);
}
`

export const vertexShaderSrc = `#version 300 es
  in vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);  
  } 
`
export const initialState = {
  iResolution: [2000, 2000, 2000] as Vec3,
  lower: [-20, -20, -20] as Vec3,
  upper: [20, 20, 20] as Vec3,
  step: 50
}

export type State = typeof initialState
export type ShaderSrc = {
  entry: string
  funcs: string[]
}
export const setupWebGL = (canvas: HTMLCanvasElement, src: ShaderSrc) => {
  const gl = canvas.getContext('webgl2')
  if (!gl) {
    return
  }

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  if (!vertexShader) {
    return
  }
  gl.shaderSource(vertexShader, vertexShaderSrc)
  gl.compileShader(vertexShader)
  console.log(gl.getShaderInfoLog(vertexShader))

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  if (!fragmentShader) {
    return
  }
  const fragmentSrc = fragmentShaderSrc(src)
  const fragmentSrcLines = fragmentSrc
    .split('\n')
    .map((l, i) => `${i + 1}| ${l}`)
    .join('\n')
  console.log(fragmentSrcLines)
  gl.shaderSource(fragmentShader, fragmentSrc)
  gl.compileShader(fragmentShader)
  console.log(gl.getShaderInfoLog(fragmentShader))

  const program = gl.createProgram()
  if (!program) {
    return
  }
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const vertices = new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1])

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  gl.useProgram(program)
  const gllets: any = {}
  Object.keys(initialState).forEach((key) => {
    console.log('locating', key)
    gllets[key] = gl.getUniformLocation(program, key)
  })

  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const setState = (state: State) => {
    // set bindings
    Object.entries(state).forEach(([key, val]) => {
      if (val instanceof Array) {
        switch (val.length) {
          // case 1:
          //   gl.uniform1fv(gllets[key], val);
          //   break;
          // case 2:
          //   gl.uniform2fv(gllets[key], val);
          //   break;
          case 3:
            gl.uniform3fv(gllets[key], val)
            break
          // case 4:
          //   gl.uniform4fv(gllets[key], val);
          //   break;
          default:
            throw 'unable to accomodate larger than 4 entries'
        }
      } else {
        gl.uniform1f(gllets[key], val)
      }
      //console.log('setting', key, val);
    })

    // draw
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    const length = gl.drawingBufferWidth * gl.drawingBufferHeight
    const pixels = new Uint8Array(length * 4)
    gl.readPixels(
      0,
      0,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
    )
    return pixels
  }
  setState(initialState)
  return setState
}
