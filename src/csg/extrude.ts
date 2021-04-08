import { clamp, V2 } from "../util/math";
import { union } from "./boolean";
import { addFunc, f, wrap } from "./glsl-util";
import { rotate } from "./manipulate";

export function extrude(height: number, s: Shape2): Shape3 {
  const h = height / 2;
  const sp = (p: Vec3) => {
    const d = s([p[0], p[1]]);
    const w = Math.abs(p[2]) - h;

    const outside = V2.length([Math.max(d, 0), Math.max(w, 0)]);
    const inside = Math.min(Math.max(d, w), 0);
    return outside + inside;
  }
  sp.gl = addFunc('float', 'vec3 p', [
    `float d = ${s.gl.name}(p.xy);`,
    `vec2 w = vec2( d, abs(p.z) - ${f(h)} );`,
    `return min(max(w.x,w.y),0.0) + length(max(w,0.0));`
  ].join('\n'), [s.gl]);
  return sp;
}


export function revolve(axis: Axis, offset: number, s: Shape2): Shape3 {
  switch (axis) {
    case 'x': return wrap((p) => s([V2.length([p[1], p[2]]) - offset, p[0]]),
      'float', 'vec3 p', `return $1(vec2(length(p.yz)-${f(offset)},p.x));`, [s.gl]);
    case 'y': return wrap((p) => s([V2.length([p[0], p[2]]) - offset, p[1]]),
      'float', 'vec3 p', `return $1(vec2(length(p.xz)-${f(offset)},p.y));`, [s.gl]);
    case 'z': return wrap((p) => s([V2.length([p[0], p[1]]) - offset, p[2]]),
      'float', 'vec3 p', `return $1(vec2(length(p.xy)-${f(offset)},p.z));`, [s.gl]);
  }
}

export function mirror(plane: Plane, s: Shape3): Shape3 {
  switch (plane) {
    case 'yz': return wrap(
      (p) => s([Math.abs(p[0]), p[1], p[2]]),
      'float', 'vec3 p', `return $1(vec3(abs(p.x),p.y,p.z));`, [s.gl]);
    case 'xy': return wrap(
      (p) => s([p[0], p[1], Math.abs(p[2])]),
      'float', 'vec3 p', `return $1(vec3(p.x,p.y,abs(p.z)));`, [s.gl]);
    case 'xz': return wrap(
      (p) => s([p[0], Math.abs(p[1]), p[2]]),
      'float', 'vec3 p', `return $1(vec3(p.x,abs(p.y),p.z));`, [s.gl]);
  }
}

// tile in 1-Dimension
const tile1D = (p: [times: number, width: number]) => {
  const [times, width] = p;
  return (x: number) => x - width * clamp(Math.round(x / width), -times, times);
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
    'float', 'vec3 p', [
      `vec3 m = vec3(${f(o.x ? o.x[0] : 0)},${f(o.y ? o.y[0] : 0)},${f(o.z ? o.z[0] : 0)});`,
      `vec3 c = vec3(${f(o.x ? o.x[1] : 0)},${f(o.y ? o.y[1] : 0)},${f(o.z ? o.z[1] : 0)});`,
      `vec3 q = p-c*clamp(round(p/c),-m,m);`,
      `return $1( q );`
    ].join('\n'), [s.gl]);
}

type TileCircularParams = {
  n: number,
  degrees?: number
}
export const tileCircular = (o: TileCircularParams, s: Shape3): Shape3 => {
  const arclength = o.degrees || 360;
  const angle = arclength / o.n;
  let tmp = s;
  for (let i = 0; i < o.n; i++) {
    const rot = rotate('z', angle, tmp);
    tmp = union(s, rot);
  }
  return tmp;
}