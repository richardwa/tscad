export const fragmentShaderSrc = ({ entry, funcs }: ShaderSrc) => `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform vec3 cameraPos;
uniform vec3 cameraDir;
uniform vec3 cameraTop;
uniform float zoom;

out vec4 FragColor;

#define MAX_STEPS 100
#define MAX_DIST 1000.
#define SURF_DIST .01

${funcs.join('\n\n')}

float GetDist(vec3 p) {
  return ${entry}(p);
}

float RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    
  for(int i=0; i<MAX_STEPS; i++) {
    vec3 p = ro + rd*dO;
    float dS = GetDist(p);
    dO += dS;
    if(dO>MAX_DIST || dS<SURF_DIST) break;
  }
    
  return dO;
}

vec3 GetNormal(vec3 p) {
	float d = GetDist(p);
  vec2 e = vec2(.01, 0);
  
  vec3 n = d - vec3(
    GetDist(p-e.xyy),
    GetDist(p-e.yxy),
    GetDist(p-e.yyx));
    
  return normalize(n);
}

float GetLight(vec3 p) {
  vec3 lightPos = cameraPos;
  lightPos.xz += vec2(0,1)*2.;
  vec3 l = normalize(lightPos-p);
  vec3 n = GetNormal(p);
  float dif = dot(n, l);
  return dif;
}

vec4 getAxisPixel(vec3 rd, vec3 ro){
  float threshold = 0.002*length(cameraPos)/zoom;

  vec3 u = vec3(1.,0.,0.);
  vec3 c = cross(u, rd);
  float d = abs(dot(ro,c))/length(c);
  if (d < threshold){
    return vec4(u,length(cross(ro,u)));
  }

  u = vec3(0.,1.,0.);
  c = cross(u, rd);
  d = abs(dot(ro,c))/length(c);
  if (d < threshold){
    return vec4(u,length(cross(ro,u)));
  }

  u = vec3(0.,0.,1.);
  c = cross(u, rd);
  d = abs(dot(ro,c))/length(c);
  if (d < threshold){
    return vec4(u,length(cross(ro,u)));
  }
  return  vec4(0.,0.,0.,-1.);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ){
  vec2 uv = fragCoord/iResolution.xy;
  uv = uv * 2. - 1.;
  vec3 col = vec3(0);
  vec3 ro = cameraPos;
  vec3 right = cross(cameraDir,cameraTop);

  vec3 rd = normalize(cameraDir*zoom+ uv.x*right + uv.y*cameraTop);
  vec4 axisPixel = getAxisPixel(rd,ro);
  
  float d = RayMarch(ro, rd);
  if (d >= MAX_DIST){
    if (axisPixel[3] > 0.){
      fragColor= vec4(axisPixel.xyz,1.);
    }else{
      fragColor= vec4(.25,.25,.50,1.);
    }
    return;
  }
  
  vec3 p = ro + rd * d; 
  float dif = GetLight(p);
  col += vec3(dif);
  col += axisPixel.xyz;
  fragColor = vec4(col,1.0);
  
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
  iResolution: [600, 600, 1] as Vec3,
  cameraPos: [0, 0, -80] as Vec3,
  cameraDir: [0, 0, 1] as Vec3,
  cameraTop: [1, 0, 0] as Vec3,
  zoom: 4
}

export type State = typeof initialState
export type ShaderSrc = {
  entry: string
  funcs: string[]
}
export const setupWebGL = (canvas: HTMLCanvasElement, src: ShaderSrc) => {
  const gl = canvas.getContext('webgl2')
  if (!gl) return
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  if (!vertexShader) return

  gl.shaderSource(vertexShader, vertexShaderSrc)
  gl.compileShader(vertexShader)
  console.log(gl.getShaderInfoLog(vertexShader))

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  if (!fragmentShader) return

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
  if (!program) return

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
  }
  setState(initialState)
  return setState
}
