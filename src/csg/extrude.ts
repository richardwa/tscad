import { clamp, Vector } from "../util/math";
import { addFunc, f, wrap } from "./glsl-util";

export function extrude(height: number, s: Shape2): Shape3 {
  const h = height / 2;
  const sp = (p: Vec3) => {
    const d = s([p[0], p[1]]);
    const w = Math.abs(p[2]) - h;

    const outside = new Vector([Math.max(d, 0), Math.max(w, 0)]).magnitude();
    const inside = Math.min(Math.max(d, w), 0);
    return outside + inside;
  }
  sp.gl = addFunc('float', 'vec3 p', [
    `float d = ${s.gl}(p.xy);`,
    `vec2 w = vec2( d, abs(p.z) - ${f(h)} );`,
    `return min(max(w.x,w.y),0.0) + length(max(w,0.0));`
  ].join('\n'));
  return sp;
}


export function revolve(axis: Axis, offset: number, s: Shape2): Shape3 {
  switch (axis) {
    case 'x': return wrap((p) => s([new Vector([p[1], p[2]]).magnitude() - offset, p[0]]),
      addFunc('float', 'vec3 p', `return ${s.gl}(length(p.yz)-${f(offset)},p.x)`));
    case 'y': return wrap((p) => s([new Vector([p[0], p[2]]).magnitude() - offset, p[1]]),
      addFunc('float', 'vec3 p', `return ${s.gl}(length(p.xz)-${f(offset)},p.y)`));
    case 'z': return wrap((p) => s([new Vector([p[0], p[1]]).magnitude() - offset, p[2]]),
      addFunc('float', 'vec3 p', `return ${s.gl}(length(p.xy)-${f(offset)},p.z)`));
  }
}

export function mirror(plane: Plane, s: Shape3): Shape3 {
  switch (plane) {
    case 'yz': return wrap(
      (p) => s([Math.abs(p[0]), p[1], p[2]]),
      addFunc('float', 'vec3 p', `return ${s.gl}(vec3(abs(p.x),p.y,p.z));`)
    );
    case 'xy': return wrap(
      (p) => s([p[0], p[1], Math.abs(p[2])]),
      addFunc('float', 'vec3 p', `return ${s.gl}(vec3(p.x,p.y,abs(p.z)));`)
    );
    case 'xz': return wrap(
      (p) => s([p[0], Math.abs(p[1]), p[2]]),
      addFunc('float', 'vec3 p', `return ${s.gl}(vec3(p.x,abs(p.y),p.z));`)
    );
  }
}

// tile in 1-Dimension
const tile1D = (p: [times: number, width: number]) => {
  const [times, width] = p;
  const upper = Math.floor(times / 2);
  const lower = -Math.floor(times / 2) + ((times + 1) % 2);
  const f = (x: number) => x - width * clamp(Math.round(x / width), lower, upper);
  // offset even numbers to keep centered after tiling
  const offset = width / 2;
  return (times % 2 === 1) ? f : (x: number) => f(x + offset);
}

type TileParams = {
  [a in Axis]?: [times: number, width: number]
}
const identity = (n: number) => n;
export function tile(o: TileParams, s: Shape3): Shape3 {
  const tileX = o.x ? tile1D(o.x) : identity;
  const tileY = o.y ? tile1D(o.y) : identity;
  const tileZ = o.z ? tile1D(o.z) : identity;
  return wrap((p) => s([tileX(p[0]), tileY(p[1]), tileZ(p[2])]),
    addFunc('float', 'vec3 p', [
      `vec3 c = vec3(${f(o.x ? o.x[0] : 0)},${f(o.y ? o.y[0] : 0)},${f(o.z ? o.z[0] : 0)});`,
      `vec3 m = vec3(${f(o.x ? o.x[1] : 0)},${f(o.y ? o.y[1] : 0)},${f(o.z ? o.z[1] : 0)});`,
      `vec3 q = p-c*clamp(round(p/c),-m,m);`,
      `return ${s.gl}( q );`
    ].join('\n')));
}