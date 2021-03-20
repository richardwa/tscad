import { wrap, v3, f, addFunc } from "./glsl-util";

export function translate(translation: Vec3, s: Shape3): Shape3 {
  const fn = (v: number, i: number) => v - translation[i];
  const sp = (p: Vec3) => s(p.map(fn) as Vec3);
  sp.gl = addFunc('float', 'vec3 p', `return $1(p-${v3(translation)});`, [s.gl]);
  return sp;
}

export function rotate(axis: Axis, degrees: number, s: Shape3): Shape3 {
  const sn = Math.sin(degrees * 2 * Math.PI / 360);
  const cs = Math.cos(degrees * 2 * Math.PI / 360);

  switch (axis) {
    case 'x': return wrap(
      ([x, y, z]) => s([x, y * cs - z * sn, y * sn + z * cs]), 'float', 'vec3 p',
      `return ($1(vec3(p.x,p.y*${f(cs)}-p.z*${f(sn)},p.y*${f(sn)}+p.z*${f(cs)})));`, [s.gl]);
    case 'y': return wrap(
      ([x, y, z]) => s([x * cs + z * sn, y, z * cs - x * sn]), 'float', 'vec3 p',
      `return ($1(vec3(p.x*${f(cs)}+p.z*${f(sn)},p.y,p.z*${f(cs)}-p.x*${f(sn)})));`, [s.gl]);
    case 'z': return wrap(
      ([x, y, z]) => s([x * cs - y * sn, x * sn + y * cs, z]), 'float', 'vec3 p',
      `return ($1(vec3(p.x*${f(cs)}-p.y*${f(sn)},p.x*${f(sn)}+p.y*${f(cs)},p.z)));`, [s.gl]);
  }
}

export function scale(d: number, s: Shape3): Shape3 {
  const sc = (a: number) => a / d;
  const sp = (p: Vec3) => s(p.map(sc) as Vec3) * d;
  sp.gl = addFunc('float', 'vec3 p', `return $1(p/${f(d)})*${f(d)};`, [s.gl]);
  return sp;
}