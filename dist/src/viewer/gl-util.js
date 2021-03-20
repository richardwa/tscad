"use strict";
exports.__esModule = true;
exports.setupWebGL = exports.vertexShaderSrc = exports.fragmentShaderSrc = exports.initialState = void 0;
exports.initialState = {
    iResolution: [600, 600, 1],
    cameraPos: [0, 0, -80],
    cameraDir: [0, 0, 1],
    cameraTop: [0, 1, 0],
    zoom: 4
};
var fragmentShaderSrc = function (_a) {
    var entry = _a.entry, funcs = _a.funcs;
    return "\nprecision highp float;\n\nuniform vec3 iResolution;\nuniform vec3 cameraPos;\nuniform vec3 cameraDir;\nuniform vec3 cameraTop;\nuniform float zoom;\n\n#define MAX_STEPS 100\n#define MAX_DIST 1000.\n#define SURF_DIST .01\n\n" + funcs.join('\n') + "\n\nfloat GetDist(vec3 p) {\n  return " + entry + "(p);\n}\n\nfloat RayMarch(vec3 ro, vec3 rd) {\n\tfloat dO=0.;\n    \n  for(int i=0; i<MAX_STEPS; i++) {\n    vec3 p = ro + rd*dO;\n    float dS = GetDist(p);\n    dO += dS;\n    if(dO>MAX_DIST || dS<SURF_DIST) break;\n  }\n    \n  return dO;\n}\n\nvec3 GetNormal(vec3 p) {\n\tfloat d = GetDist(p);\n  vec2 e = vec2(.01, 0);\n  \n  vec3 n = d - vec3(\n    GetDist(p-e.xyy),\n    GetDist(p-e.yxy),\n    GetDist(p-e.yyx));\n    \n  return normalize(n);\n}\n\nfloat GetLight(vec3 p) {\n  vec3 lightPos = cameraPos;\n  lightPos.xz += vec2(0,1)*2.;\n  vec3 l = normalize(lightPos-p);\n  vec3 n = GetNormal(p);\n  float dif = dot(n, l);\n  return dif;\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord ){\n  vec2 uv = fragCoord/iResolution.xy;\n  uv = uv * 2. - 1.;\n  vec3 col = vec3(0);\n  vec3 ro = cameraPos;\n  vec3 r = cross(cameraDir,cameraTop);\n\n  vec3 rd = normalize(cameraDir*zoom+ uv.x*r + uv.y*cameraTop);\n\n  float d = RayMarch(ro, rd);\n  if (d >= MAX_DIST){\n    fragColor = vec4(.5,.5,1,1);\n    return;\n  }\n    \n  vec3 p = ro + rd * d; \n  float dif = GetLight(p);\n  col = vec3(dif);\n  fragColor = vec4(col,1.0);\n}\n\nvoid main() {\n  mainImage(gl_FragColor, gl_FragCoord.xy);\n}\n\n";
};
exports.fragmentShaderSrc = fragmentShaderSrc;
exports.vertexShaderSrc = "\n\t// vertex shader's code goes here\n  attribute vec2 position;\n  void main() {\n    gl_Position = vec4(position, 0.0, 1.0);  \n  } \n";
var setupWebGL = function (canvas, src) {
    var gl = canvas.getContext("webgl");
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, exports.vertexShaderSrc);
    gl.compileShader(vertexShader);
    console.log(gl.getShaderInfoLog(vertexShader));
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    var fragmentSrc = exports.fragmentShaderSrc(src);
    console.log(fragmentSrc);
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
    var glVars = {};
    Object.keys(exports.initialState).forEach(function (key) {
        console.log('locating', key);
        glVars[key] = gl.getUniformLocation(program, key);
    });
    var position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    var setState = function (state) {
        // set bindings
        Object.entries(state).forEach(function (_a) {
            var key = _a[0], val = _a[1];
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
            }
            else {
                gl.uniform1f(glVars[key], val);
            }
            //console.log('setting', key, val);
        });
        // draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    setState(exports.initialState);
    return setState;
};
exports.setupWebGL = setupWebGL;
//# sourceMappingURL=gl-util.js.map